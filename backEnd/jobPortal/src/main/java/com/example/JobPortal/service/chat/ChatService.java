package com.example.JobPortal.service.chat;

import com.example.JobPortal.dto.chat.*;
import com.example.JobPortal.entity.chat.ChatContext;
import com.example.JobPortal.entity.chat.Conversation;
import com.example.JobPortal.dto.JobDto;
import com.example.JobPortal.entity.chat.Message;
import com.example.JobPortal.enums.chat.ConversationStatus;
import com.example.JobPortal.model.CandidateProfiles;
import com.example.JobPortal.repository.CandidateProfilesRepository;
import com.example.JobPortal.repository.chat.ChatContextRepository;
import com.example.JobPortal.repository.chat.ConversationRepository;
import com.example.JobPortal.repository.chat.MessageRepository;
import com.example.JobPortal.service.itf.JobService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final JobService jobService;
    private final OpenAIService openAIService;
    private final MessageRepository messageRepository;
    private final IndustryKeywordService industryKeywordService;
    private final ChatContextRepository chatContextRepository;
    private final CandidateProfilesRepository candidateRepository;
    private final ObjectMapper objectMapper;

    // ===============================================================
    // 🧩 TẠO CONVERSATION MỚI
    // ===============================================================
    public ConversationDto createConversation(Long userId) {
        Conversation conversation = Conversation.builder()
                .userId(userId)
                .status(ConversationStatus.PENDING)
                .build();
        conversationRepository.save(conversation);
        return toDto(conversation);
    }

    // ===============================================================
    // 💬 XỬ LÝ TIN NHẮN CHAT
    // ===============================================================
    @Transactional
    public SendMessageResponse sendMessage(SendMessageRequest request) throws JsonProcessingException {
        System.out.println("[DEBUG] conversationId nhận được từ request: " + request.getConversationId());

        Long conversationId = request.getConversationId();
        Long userId = request.getUserID();
        Long candidateId = null;

        if (userId != null) {
            candidateId = candidateRepository.findByUserId(userId)
                    .map(CandidateProfiles::getId)
                    .orElse(null);
        }

        // ✅ Nếu FE chưa gửi conversationId → tạo mới conversation
        if (conversationId == null) {
            Conversation newConv = Conversation.builder()
                    .userId(userId)
                    .status(ConversationStatus.PENDING)
                    .build();

            newConv = conversationRepository.saveAndFlush(newConv);
            conversationId = newConv.getId();
            System.out.println("[INFO] ➕ Created new conversation: " + conversationId);
        }

        Long finalConversationId = conversationId;

        // ✅ Load hoặc tạo ChatContext
        ChatContext chatContext = chatContextRepository.findByConversationId(conversationId)
                .orElseGet(() -> chatContextRepository.saveAndFlush(
                        ChatContext.builder().conversationId(finalConversationId).build()
                ));

        String rawMessage = request.getMessage().trim().toLowerCase(Locale.ROOT);
        System.out.println("[ChatBot] User message: " + rawMessage);

        // ==============================================================
        // 💾 Luôn lưu tin nhắn người dùng (chỉ 1 lần)
        // ==============================================================
        saveSingleMessage(conversationId, "user", rawMessage, userId, candidateId, null);

        // ==============================================================
        // CASE 1: CẢM ƠN
        // ==============================================================
        if (isThankYouMessage(rawMessage)) {
            String reply = "Rất vui khi có thể giúp bạn 😊. Chúc bạn sớm tìm được công việc ưng ý! Nếu bạn muốn, mình có thể gợi ý thêm vài job khác?";
            chatContext.setLastMessage(rawMessage);
            chatContextRepository.saveAndFlush(chatContext);
            saveSingleMessage(conversationId, "assistant", reply, userId, candidateId, null);
            return SendMessageResponse.builder().reply(reply).jobs(List.of()).conversationId(conversationId).build();
        }

        // ==============================================================
        // CASE 2: TẠM BIỆT
        // ==============================================================
        if (isGoodbyeMessage(rawMessage)) {
            String reply = "Hẹn gặp lại bạn 👋 Chúc bạn một ngày tốt lành và sớm tìm được công việc như ý!";
            chatContext.setLastMessage(rawMessage);
            chatContextRepository.saveAndFlush(chatContext);
            saveSingleMessage(conversationId, "assistant", reply, userId, candidateId, null);
            return SendMessageResponse.builder().reply(reply).jobs(List.of()).conversationId(conversationId).build();
        }

        // ==============================================================
        // CASE 3: XỬ LÝ NGÀNH + ĐỊA ĐIỂM
        // ==============================================================
        var detectedIndustry = industryKeywordService.detectIndustryFromMessage(rawMessage);
        var detectedLocation = industryKeywordService.detectLocationFromMessage(rawMessage);
        Long industryId = null;
        String location = null;

        if (detectedIndustry.isPresent()) {
            industryId = detectedIndustry.get().getId();
            if (!industryId.equals(chatContext.getLastIndustryId())) {
                chatContext.setLastShownIndex(0);
                chatContext.setShownJobIds("");
            }
            chatContext.setLastIndustryId(industryId);
        } else if (chatContext.getLastIndustryId() != null) {
            industryId = chatContext.getLastIndustryId();
        }

        if (detectedLocation.isPresent()) {
            location = detectedLocation.get();
            chatContext.setLastLocation(location);
        } else if (chatContext.getLastLocation() != null && (rawMessage.contains("ở") || rawMessage.contains("khu vực"))) {
            location = chatContext.getLastLocation();
        }

        // ✅ Flush context ngay tại đây (fix lỗi metadata không lưu)
        if (industryId != null) chatContext.setLastIndustryId(industryId);
        if (location != null) chatContext.setLastLocation(location);
        chatContext.setLastMessage(rawMessage);
        chatContextRepository.saveAndFlush(chatContext);

        // ==============================================================
        // CASE 4: XEM THÊM JOB
        // ==============================================================
        if (rawMessage.matches(".*(xem thêm|thêm job|nữa|còn job).*")) {
            if (chatContext.getLastIndustryId() != null) {
                Long industryIdLast = chatContext.getLastIndustryId();
                List<JobDto> allJobs = jobService.findByIndustryId(industryIdLast);

                int startIndex = chatContext.getLastShownIndex() != null ? chatContext.getLastShownIndex() : 0;
                int endIndex = Math.min(startIndex + 5, allJobs.size());

                if (startIndex >= allJobs.size()) {
                    String reply = "Hiện tại mình đã hiển thị tất cả job phù hợp rồi nhé 😊.";
                    saveSingleMessage(conversationId, "assistant", reply, userId, candidateId, null);
                    return SendMessageResponse.builder().reply(reply).jobs(List.of()).conversationId(conversationId).build();
                }

                List<JobDto> nextJobs = allJobs.subList(startIndex, endIndex);
                chatContext.setLastShownIndex(endIndex);
                chatContextRepository.saveAndFlush(chatContext);

                String aiReply = "Dưới đây là thêm một vài job nữa mà mình tìm thấy 👇";
                String metadataJson = objectMapper.writeValueAsString(nextJobs);
                saveSingleMessage(conversationId, "assistant", aiReply, userId, candidateId, metadataJson);

                return SendMessageResponse.builder()
                        .reply(aiReply)
                        .jobs(toSuggestions(nextJobs))
                        .conversationId(conversationId)
                        .build();
            } else {
                String reply = "Bạn muốn xem thêm job của ngành nào nhỉ? (ví dụ: IT, giáo dục, thiết kế...)";
                saveSingleMessage(conversationId, "assistant", reply, userId, candidateId, null);
                return SendMessageResponse.builder().reply(reply).jobs(List.of()).conversationId(conversationId).build();
            }
        }

        // ==============================================================
        // CASE 5: TÌM JOB THEO NGỮ CẢNH
        // ==============================================================
        if (industryId == null && chatContext.getLastIndustryId() != null)
            industryId = chatContext.getLastIndustryId();
        if (location == null && chatContext.getLastLocation() != null)
            location = chatContext.getLastLocation();

        List<JobDto> matchedJobs;
        if (industryId != null && location != null) matchedJobs = jobService.findByIndustryAndLocation(industryId, location);
        else if (industryId != null) matchedJobs = jobService.findByIndustryId(industryId);
        else if (location != null) matchedJobs = jobService.findByLocation(location);
        else matchedJobs = jobService.searchJobs(rawMessage, null);

        // ==============================================================
        // CASE 6: KHÔNG TÌM THẤY JOB
        // ==============================================================
        if (matchedJobs == null || matchedJobs.isEmpty()) {
            String reply = isGreetingMessage(rawMessage)
                    ? "Chào bạn 👋! Mình là Job Assistant 🤖. Mình có thể giúp bạn tìm việc phù hợp. Bạn đang muốn tìm công việc ở lĩnh vực nào (IT, thiết kế, marketing...)?"
                    : "Hiện chưa có công việc nào khớp với yêu cầu này. Bạn có muốn mình gợi ý công việc ở ngành khác không?";
            saveSingleMessage(conversationId, "assistant", reply, userId, candidateId, null);
            return SendMessageResponse.builder().reply(reply).jobs(List.of()).conversationId(conversationId).build();
        }

        // ==============================================================
        // CASE 7: TRẢ JOB VÀ LƯU METADATA
        // ==============================================================
        matchedJobs = matchedJobs.stream().limit(5).collect(Collectors.toList());
        String aiReply;
        try {
            aiReply = openAIService.getChatResponseWithJobs(rawMessage, matchedJobs);
        } catch (Exception e) {
            System.err.println("[WARN] OpenAIService error → fallback");
            aiReply = "Dưới đây là danh sách các job phù hợp với yêu cầu của bạn 👇";
        }

        String metadataJson = objectMapper.writeValueAsString(matchedJobs);
        saveSingleMessage(conversationId, "assistant", aiReply, userId, candidateId, metadataJson);

        return SendMessageResponse.builder()
                .reply(aiReply)
                .jobs(toSuggestions(matchedJobs))
                .conversationId(conversationId)
                .build();
    }

    // ===============================================================
    // 💾 LƯU TIN NHẮN (CHỈ 1 BẢN GHI)
    // ===============================================================
    private void saveSingleMessage(Long conversationId, String sender, String content,
                                   Long userId, Long candidateId, String metadata) {
        try {
            messageRepository.save(
                    Message.builder()
                            .conversation(Conversation.builder().id(conversationId).build())
                            .sender(sender)
                            .content(content)
                            .metadata(metadata)
                            .userId(userId)
                            .build()
            );
            System.out.println("[INFO] 💾 Saved " + sender + " message for conversation " + conversationId);
        } catch (Exception e) {
            System.err.println("[ERROR] Lỗi khi lưu message: " + e.getMessage());
        }
    }

    // ===============================================================
    // 🔁 CONVERT DTO
    // ===============================================================
    private List<JobSuggestionDto> toSuggestions(List<JobDto> jobs) {
        return jobs.stream().map(j -> JobSuggestionDto.builder()
                .id(j.getId())
                .title(j.getTitle())
                .postedByName(j.getPostedByName())
                .location(j.getLocation())
                .salaryMin(j.getSalaryMin())
                .salaryMax(j.getSalaryMax())
                .jobIMG(j.getJobIMG())
                .build()).collect(Collectors.toList());
    }

    public ConversationDto toDto(Conversation conv) {
        return ConversationDto.builder()
                .id(conv.getId())
                .userId(conv.getUserId())
                .status(conv.getStatus().name())
                .createdAt(conv.getCreatedAt())
                .build();
    }

    // ===============================================================
    // 📜 LẤY DANH SÁCH TIN NHẮN
    // ===============================================================
    public List<MessageDto> getMessages(Long conversationId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream().map(m -> {
            List<JobSuggestionDto> jobs = null;
            if (m.getMetadata() != null && !m.getMetadata().isEmpty()) {
                try {
                    jobs = objectMapper.readValue(m.getMetadata(), new TypeReference<List<JobSuggestionDto>>() {});
                } catch (Exception e) {
                    System.err.println("[WARN] Parse metadata JSON error: " + e.getMessage());
                }
            }
            return MessageDto.builder()
                    .sender(m.getSender())
                    .content(m.getContent())
                    .createdAt(m.getCreatedAt())
                    .jobs(jobs)
                    .build();
        }).collect(Collectors.toList());
    }

    // ===============================================================
    // 🤖 HELPER FUNCTIONS
    // ===============================================================
    private boolean isGreetingMessage(String msg) {
        return msg.matches(".*(hi|xin chào|chào|hello|hey|hí|helo|yo|alo).*");
    }

    private boolean isThankYouMessage(String msg) {
        return msg.matches(".*(cảm ơn|thanks|thank you|tks|thx).*");
    }

    private boolean isGoodbyeMessage(String msg) {
        return msg.matches(".*(tạm biệt|bye|goodbye|hẹn gặp lại|see you|gặp lại sau|tôi đi đây).*");
    }

    @Transactional
    public void deleteConversation(Long conversationId) {
        messageRepository.deleteByConversationId(conversationId);
        conversationRepository.deleteById(conversationId);
    }
}

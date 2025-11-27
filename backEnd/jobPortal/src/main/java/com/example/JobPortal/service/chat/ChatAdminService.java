package com.example.JobPortal.service.chat;

import com.example.JobPortal.dto.chat.ConversationDto;
import com.example.JobPortal.dto.chat.JobSuggestionDto;
import com.example.JobPortal.dto.chat.MessageDto;
import com.example.JobPortal.entity.chat.*;
import com.example.JobPortal.enums.chat.ConversationStatus;
import com.example.JobPortal.repository.chat.ConversationRepository;
import com.example.JobPortal.repository.chat.MessageRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatAdminService {
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    public List<ConversationDto> getAllConversations() {
        return conversationRepository.findAll().stream()
                .map(c -> {
                    int count = messageRepository.countByConversationId(c.getId());
                    return ConversationDto.builder()
                            .id(c.getId())
                            .userId(c.getUserId())
                            .status(c.getStatus().name())
                            .createdAt(c.getCreatedAt())
                            .messageCount(count)
                            .build();
                })
                .collect(Collectors.toList());
    }


    public ConversationDto markUseful(Long id) {
        Conversation conv = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        conv.setStatus(ConversationStatus.USEFUL);
        conversationRepository.save(conv);
        return toDto(conv);
    }

    public ConversationDto markSpam(Long id) {
        Conversation conv = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        conv.setStatus(ConversationStatus.SPAM);
        conversationRepository.save(conv);
        return toDto(conv);
    }

    private ConversationDto toDto(Conversation conv) {
        return ConversationDto.builder()
                .id(conv.getId())
                .userId(conv.getUserId())
                .status(conv.getStatus().name())
                .createdAt(conv.getCreatedAt())
                .build();
    }

    public ConversationDto getConversationById(Long id) {
        var conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện"));

        var messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(id)
                .stream()
                .map(m -> {
                    List<JobSuggestionDto> jobs = null;
                    if (m.getMetadata() != null && !m.getMetadata().isEmpty()) {
                        try {
                            jobs = objectMapper.readValue(
                                    m.getMetadata(),
                                    new TypeReference<List<JobSuggestionDto>>() {}
                            );
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
                })
                .collect(Collectors.toList());


        return ConversationDto.builder()
                .id(conversation.getId())
                .userId(conversation.getUserId())
                .createdAt(conversation.getCreatedAt())
                .status(conversation.getStatus().name())
                .messageCount(messages.size())
                .messages(messages)
                .build();
    }
}

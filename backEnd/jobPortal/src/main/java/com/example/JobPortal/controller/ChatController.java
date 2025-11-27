package com.example.JobPortal.controller;

import com.example.JobPortal.dto.chat.*;
import com.example.JobPortal.entity.chat.Message;
import com.example.JobPortal.repository.chat.ConversationRepository;
import com.example.JobPortal.service.chat.ChatService;
import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "chatbot-controller", description = "Quản lý đoạn chat của người dùng với AI")
public class ChatController {

    private final ChatService chatService;
    private final ConversationRepository conversationRepository;

    @PostMapping("/conversation")
    public ConversationDto createConversation(@RequestParam Long userId) {
        return chatService.createConversation(userId);
    }

    @PostMapping("/send")
    public SendMessageResponse sendMessage(@RequestBody SendMessageRequest request) throws JsonProcessingException {
        return chatService.sendMessage(request);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public List<MessageDto> getMessages(@PathVariable Long conversationId) {
        List<MessageDto> messages = chatService.getMessages(conversationId);
        System.out.println("[DEBUG] Loaded messages for conversation " + conversationId + ": " + messages.size());
        return messages;
    }

    @GetMapping("/conversations")
    public List<ConversationDto> getConversations(@RequestParam Long userId) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(chatService::toDto)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/conversation/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long conversationId) {
        chatService.deleteConversation(conversationId);
        return ResponseEntity.noContent().build();
    }



}

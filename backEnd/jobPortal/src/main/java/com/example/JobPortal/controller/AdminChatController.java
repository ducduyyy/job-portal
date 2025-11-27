package com.example.JobPortal.controller;

import com.example.JobPortal.dto.chat.ConversationDto;
import com.example.JobPortal.service.chat.ChatAdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
@Tag(name = "admin-controller", description = "Quản lý thông tin của người dùng")
public class AdminChatController {

    private final ChatAdminService chatAdminService;

    @GetMapping("/conversations")
    public List<ConversationDto> getAll() {
        return chatAdminService.getAllConversations();
    }

    @PutMapping("/conversations/{id}/mark-useful")
    public ConversationDto markUseful(@PathVariable Long id) {
        return chatAdminService.markUseful(id);
    }

    @PutMapping("/conversations/{id}/mark-spam")
    public ConversationDto markSpam(@PathVariable Long id) {
        return chatAdminService.markSpam(id);
    }

    @GetMapping("/conversations/{id}")
    public ConversationDto getConversationById(@PathVariable Long id) {
        return chatAdminService.getConversationById(id);
    }

}

package com.example.JobPortal.repository.chat;

import com.example.JobPortal.entity.chat.ChatContext;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatContextRepository extends JpaRepository<ChatContext, Long> {
    Optional<ChatContext> findByConversationId(Long conversationId);
}

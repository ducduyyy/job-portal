package com.example.JobPortal.repository.chat;

import com.example.JobPortal.entity.chat.Conversation;
import com.example.JobPortal.enums.chat.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByStatus(ConversationStatus status);
    List<Conversation> findByUserIdOrderByCreatedAtDesc(Long userId);
    Conversation findTopByUserIdOrderByCreatedAtDesc(Long userId);
}

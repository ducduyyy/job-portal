package com.example.JobPortal.entity.chat;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat_context")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatContext {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id")
    private Long conversationId;

    @Column(name = "last_industry_id")
    private Long lastIndustryId;

    @Column(name = "last_location")
    private String lastLocation;

    @Column(name = "last_message", length = 2000)
    private String lastMessage;

    @Column(name = "last_shown_index")
    private Integer lastShownIndex = 0;

    // 🔹 Tùy chọn — tránh trùng job khi xem thêm
    @Column(name = "shown_job_ids", length = 2000)
    private String shownJobIds;
}

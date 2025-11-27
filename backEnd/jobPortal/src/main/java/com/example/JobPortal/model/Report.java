package com.example.JobPortal.model;

import com.example.JobPortal.enums.ReportSeverity;
import com.example.JobPortal.enums.ReportStatus;
import com.example.JobPortal.enums.ReportType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Người gửi báo cáo
    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    // Người bị báo cáo
    @ManyToOne
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;

    // Loại nội dung bị báo cáo (USER / JOB)
    @Enumerated(EnumType.STRING)
    private ReportType reportedItemType;

    // ID nội dung bị báo cáo (jobId hoặc userId)
    private Long reportedItemId;

    private String reason;

    @Enumerated(EnumType.STRING)
    private ReportStatus status = ReportStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private ReportSeverity severity = ReportSeverity.MEDIUM;

    @Column(nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

}


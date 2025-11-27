// src/main/java/com/example/JobPortal/dto/ReportDto.java
package com.example.JobPortal.dto;
import com.example.JobPortal.enums.ReportSeverity;
import com.example.JobPortal.enums.ReportStatus;
import com.example.JobPortal.enums.ReportType;
import com.example.JobPortal.model.Report;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

public record ReportDto(
        Long id,
        String reporterUsername, // Tên người báo cáo
        String reportedItemName, // Tên người bị báo cáo
        String reportedItemOwner,
        String employerEmail,
        String reason,
        ReportStatus status,
        ReportSeverity severity,
        ReportType reportedItemType,
        Long reportedItemId,
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime createdAt
) {
    public static ReportDto fromEntity(Report report, String reportedItemName,  String reportedItemOwner, String  employerEmail) {
        return new ReportDto(
                report.getId(),
                report.getReporter() != null ? report.getReporter().getUsername() : "N/A",
                reportedItemName,
                reportedItemOwner,
                employerEmail,
                report.getReason(),
                report.getStatus(),
                report.getSeverity(),
                report.getReportedItemType(),
                report.getReportedItemId(),
                report.getCreatedAt()
        );
    }



}
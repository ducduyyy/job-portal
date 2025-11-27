package com.example.JobPortal.service.itf;

import com.example.JobPortal.dto.ReportDto;
import com.example.JobPortal.enums.ReportSeverity;
import com.example.JobPortal.enums.ReportStatus;
import com.example.JobPortal.model.Report;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReportService {
    Report createReport(Long reporterId, Long reportedUserId, String reason);
    Report createJobReport(Long reporterId, Long jobId, String reason);
    List<Report> getReportsAgainstUser(Long userId);
    Report updateStatus(Long reportId, ReportStatus status);

    Page<ReportDto> getAllReports(ReportStatus status, ReportSeverity severity, Pageable pageable);


    ReportDto updateReportStatus(Long reportId, @NotNull ReportStatus status);

    ReportDto updateReportSeverity(Long id, ReportSeverity severity);
}


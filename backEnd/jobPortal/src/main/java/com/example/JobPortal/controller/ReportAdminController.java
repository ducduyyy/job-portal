package com.example.JobPortal.controller;

import com.example.JobPortal.dto.ReportDto;
import com.example.JobPortal.enums.ReportSeverity;
import com.example.JobPortal.enums.ReportStatus;
import com.example.JobPortal.enums.ReportType;
import com.example.JobPortal.service.itf.EmailService;
import com.example.JobPortal.service.itf.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Tag(name = "admin-controller", description = "Quản lý thông tin của người dùng")
public class ReportAdminController {

    private final ReportService reportService;
    private final EmailService emailService;

    @GetMapping
    public Page<ReportDto> getAllReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) ReportSeverity severity,
            Pageable pageable
    ) {
        return reportService.getAllReports(status, severity, pageable);
    }


//    @PutMapping("/{id}/status")
//    public ReportDto updateStatus(
//            @PathVariable Long id,
//            @RequestParam ReportStatus status) {
//        return reportService.updateReportStatus(id, status);
//    }

    @PutMapping("/{id}/severity")
    public ReportDto updateSeverity(
            @PathVariable Long id,
            @RequestParam ReportSeverity severity
    ) {
        return reportService.updateReportSeverity(id, severity);
    }

    @PutMapping("/{id}/status")
    public ReportDto updateStatus(@PathVariable Long id, @RequestParam ReportStatus status) {
        ReportDto report = reportService.updateReportStatus(id, status);
        if (status == ReportStatus.RESOLVED && report.reportedItemType() == ReportType.JOB) {
            emailService.sendJobReportedMail(report.employerEmail(), report.reportedItemName());
        }
        return report;
    }


}


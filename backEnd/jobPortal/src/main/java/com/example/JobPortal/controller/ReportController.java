package com.example.JobPortal.controller;

import com.example.JobPortal.enums.ReportStatus;
import com.example.JobPortal.enums.ReportType;
import com.example.JobPortal.model.Jobs;
import com.example.JobPortal.model.Report;
import com.example.JobPortal.repository.JobRepository;
import com.example.JobPortal.repository.ReportRepository;
import com.example.JobPortal.service.itf.EmailService;
import com.example.JobPortal.service.itf.ReportService;
import com.example.JobPortal.service.impl.ReportServiceImpl;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "report-controller", description = "Quản lý thông tin các đơn báo cáo")
public class ReportController {

    private final ReportService reportService;
    private final ReportRepository reportRepository;
    private final EmailService emailService;
    private final JobRepository jobRepository;

    @PostMapping
    public ResponseEntity<Report> createUserReport(
            @RequestParam Long reporterId,
            @RequestParam Long reportedUserId,
            @RequestParam String reason
    ) {
        Report report = reportService.createReport(reporterId, reportedUserId, reason);

        try {
            // 🔹 Gửi mail xác nhận đến candidate (người gửi report)
            String candidateEmail = report.getReporter().getEmail();
            String reportedUsername = report.getReportedUser().getUsername();

            emailService.sendCandidateReportConfirmationMail(candidateEmail, reportedUsername, reason);

        } catch (Exception e) {
            System.err.println("⚠️ Failed to send user report mail: " + e.getMessage());
        }

        return ResponseEntity.ok(report);
    }


    @PostMapping("/job")
    public ResponseEntity<Report> createJobReport(
            @RequestParam Long reporterId,
            @RequestParam Long jobId,
            @RequestParam String reason
    ) {
        Report report = ((ReportServiceImpl) reportService).createJobReport(reporterId, jobId, reason);

        try {
            String candidateEmail = report.getReporter().getEmail();
            String employerEmail = report.getReportedUser().getEmail();
            String jobTitle = jobRepository.findById(jobId)
                    .map(Jobs::getTitle)
                    .orElse("Unknown Job");

            emailService.sendCandidateReportConfirmationMail(candidateEmail, jobTitle, reason);
            emailService.sendEmployerJobReportedMail(employerEmail, jobTitle);
            System.out.println("Successfully sent job report mail");
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send report mail: " + e.getMessage());
        }

        return ResponseEntity.ok(report);
    }

    @PutMapping("/{reportId}/status")
    public ResponseEntity<Report> updateStatus(
            @PathVariable Long reportId,
            @RequestParam ReportStatus status) {
        return ResponseEntity.ok(reportService.updateStatus(reportId, status));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Report>> getReportsByJob(@PathVariable Long jobId) {
        List<Report> reports = reportRepository.findByReportedItemTypeAndReportedItemId(ReportType.JOB, jobId);
        return ResponseEntity.ok(reports);
    }
}


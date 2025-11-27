package com.example.JobPortal.service.impl;

import com.example.JobPortal.dto.ReportDto;
import com.example.JobPortal.enums.*;
import com.example.JobPortal.model.Report;
import com.example.JobPortal.model.User;
import com.example.JobPortal.repository.JobRepository;
import com.example.JobPortal.repository.ReportRepository;
import com.example.JobPortal.repository.UserRepository;
import com.example.JobPortal.service.itf.ReportService;
import com.example.JobPortal.service.util.NotificationBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final NotificationBuilder notificationBuilder;

    @Override
    public Report createReport(Long reporterId, Long reportedUserId, String reason) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        User reported = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new RuntimeException("Reported user not found"));

        Report report = Report.builder()
                .reporter(reporter)
                .reportedUser(reported)
                .reason(reason)
                .severity(ReportSeverity.MEDIUM)
                .reportedItemType(ReportType.USER)
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        reportRepository.save(report);

        // ✅ Gửi thông báo cho admin
        notificationBuilder.notifyAllAdmins(
                NotificationType.REPORT_RECEIVED,
                "A user report has been submitted by " + reporter.getUsername()
        );

        return report;
    }

    @Override
    public Report createJobReport(Long reporterId, Long jobId, String reason) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));
        var job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // ✅ Ẩn job bị report
        job.setVisible(true);
        jobRepository.save(job);

        Report report = Report.builder()
                .reporter(reporter)
                .reportedUser(job.getPostedBy().getUser())
                .reportedItemType(ReportType.JOB)
                .reportedItemId(jobId)
                .reason(reason)
                .status(ReportStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        reportRepository.save(report);

        // ✅ Employer nhận thông báo
        notificationBuilder.notifyEmployer(
                job.getPostedBy().getUser().getId(),
                NotificationType.JOB_REPORTED,
                "Your job '" + job.getTitle() + "' has been reported and hidden."
        );

        // ✅ Candidate xác nhận gửi thành công
        notificationBuilder.notifyCandidate(
                reporterId,
                NotificationType.REPORT_RECEIVED,
                "You reported the job '" + job.getTitle() + "'."
        );

        // ✅ Admin nhận thông báo
        notificationBuilder.notifyAllAdmins(
                NotificationType.REPORT_RECEIVED,
                "New job report received for '" + job.getTitle() + "'."
        );

        return report;
    }

    // 🔹 Giữ nguyên các phần dưới
    @Override
    public List<Report> getReportsAgainstUser(Long userId) {
        return reportRepository.findByReportedUser_Id(userId);
    }

    @Override
    public Report updateStatus(Long reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setStatus(status);
        return reportRepository.save(report);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportDto> getAllReports(ReportStatus status, ReportSeverity severity, Pageable pageable) {
        Page<Report> reportPage;

        if (status != null && severity != null) {
            reportPage = reportRepository.findByStatusAndSeverity(status, severity, pageable);
        } else if (status != null) {
            reportPage = reportRepository.findByStatus(status, pageable);
        } else if (severity != null) {
            reportPage = reportRepository.findBySeverity(severity, pageable);
        } else {
            reportPage = reportRepository.findAll(pageable);
        }

        return reportPage.map(report -> {
            String reportedItemName = "N/A";
            String reportedItemOwner = "N/A";
            String employerEmail = "N/A";

            if (report.getReportedItemType() == ReportType.JOB && report.getReportedItemId() != null) {
                var jobOpt = jobRepository.findById(report.getReportedItemId());
                if (jobOpt.isPresent()) {
                    var job = jobOpt.get();
                    reportedItemName = job.getTitle();
                    reportedItemOwner = job.getPostedBy().getUser().getUsername();
                    employerEmail =  job.getPostedBy().getUser().getEmail();
                }
            } else if (report.getReportedItemType() == ReportType.USER && report.getReportedUser() != null) {
                reportedItemName = report.getReportedUser().getUsername();
                reportedItemOwner = "N/A";
                employerEmail = report.getReportedUser().getEmail();
            }

            return ReportDto.fromEntity(report, reportedItemName, reportedItemOwner, employerEmail);

        });

    }

    @Override
    @Transactional
    public ReportDto updateReportSeverity(Long reportId, ReportSeverity severity) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setSeverity(severity);
        reportRepository.save(report);

        // ✅ Tính tên item được report (job hoặc user)
        String reportedItemName = "N/A";
        String reportedItemOwner = "N/A";
        String employerEmail = "N/A";

        if (report.getReportedItemType() == ReportType.JOB && report.getReportedItemId() != null) {
            var jobOpt = jobRepository.findById(report.getReportedItemId());
            if (jobOpt.isPresent()) {
                var job = jobOpt.get();
                reportedItemName = job.getTitle();
                reportedItemOwner = job.getPostedBy().getUser().getUsername();
                employerEmail = job.getPostedBy().getContactEmail();
            }
        } else if (report.getReportedItemType() == ReportType.USER && report.getReportedUser() != null) {
            reportedItemName = report.getReportedUser().getUsername();
            reportedItemOwner = "N/A";
            employerEmail  = "N/A";
        }

        return ReportDto.fromEntity(report, reportedItemName, reportedItemOwner, employerEmail);

    }


    @Override
    @Transactional
    public ReportDto updateReportStatus(Long reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(status);
        reportRepository.save(report);

        // 🔥 Gửi thông báo realtime (SSE)
        String message = "Your report for '"
                + (report.getReportedItemType() == null ? "content" : report.getReportedItemType().name())
                + "' has been " + status.name().toLowerCase() + ".";

        notificationBuilder.notifyCandidate(
                report.getReporter().getId(),
                NotificationType.REPORT_RECEIVED,
                message
        );

        // Gửi thông báo cho admin khác
        notificationBuilder.notifyAllAdmins(
                NotificationType.REPORT_RECEIVED,
                "Report #" + reportId + " has been " + status.name().toLowerCase()
        );

        // ✅ Tính reportedItemName (job title hoặc username)
        String reportedItemName = "N/A";
        String reportedItemOwner = "N/A";
        String employerEmail = "N/A";

        if (report.getReportedItemType() == ReportType.JOB && report.getReportedItemId() != null) {
            var jobOpt = jobRepository.findById(report.getReportedItemId());
            if (jobOpt.isPresent()) {
                var job = jobOpt.get();
                reportedItemName = job.getTitle();
                reportedItemOwner = job.getPostedBy().getUser().getUsername();
                employerEmail = job.getPostedBy().getContactEmail();
            }
        } else if (report.getReportedItemType() == ReportType.USER && report.getReportedUser() != null) {
            reportedItemName = report.getReportedUser().getUsername();
            reportedItemOwner = "N/A";
            employerEmail = "N/A";
        }

        return ReportDto.fromEntity(report, reportedItemName, reportedItemOwner, employerEmail);

    }

}

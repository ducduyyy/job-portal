package com.example.JobPortal.repository;

// TODO: Đảm bảo bạn đã import enum ReportStatus
import com.example.JobPortal.enums.ReportSeverity;
import com.example.JobPortal.enums.ReportStatus;
import com.example.JobPortal.enums.ReportType;
import com.example.JobPortal.model.Jobs;
import com.example.JobPortal.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByReportedUser_Id(Long userId);
    // === Cho Tab "Dashboard" ===
    long countByStatus(ReportStatus status);

    // === Cho Tab "Report Management" (Lọc) ===
    Page<Report> findByStatus(ReportStatus status, Pageable pageable);
    Page<Report> findBySeverity(ReportSeverity severity, Pageable pageable);
    Page<Report> findByStatusAndSeverity(ReportStatus status, ReportSeverity severity, Pageable pageable);

    List<Report> findByReportedItemTypeAndReportedItemId(ReportType reportType, Long id);
}
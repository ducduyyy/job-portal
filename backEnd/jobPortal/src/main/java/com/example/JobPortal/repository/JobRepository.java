package com.example.JobPortal.repository;

import com.example.JobPortal.dto.MonthlyDataDto;
import com.example.JobPortal.enums.JobStatus;
import com.example.JobPortal.model.Jobs;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Jobs, Long>, JpaSpecificationExecutor<Jobs> {
    List<Jobs> findByPostedBy_Id(Long employerId);

    List<Jobs> findByFeaturedTrue();

    // Phương thức có lỗi: Đảm bảo tham số là org.springframework.data.domain.Pageable
    Page<Jobs> findByPostedBy_IdAndStatus(Long employerId, JobStatus status, Pageable pageable);

    // Phương thức gây ra lỗi BeanCreationException
    Page<Jobs> findByPostedBy_Id(Long employerId, Pageable pageable);

    // 🔹 Job có nhiều lượt xem nhất (cho dashboard)
    @Query("""
        SELECT j FROM Jobs j
        WHERE j.postedBy.id = :employerId
        ORDER BY j.viewsCount DESC
    """)
    List<Jobs> findTopViewedJobsByEmployer(Long employerId);

    // 🔹 Job được tạo gần đây
    @Query("""
        SELECT j FROM Jobs j
        WHERE j.postedBy.id = :employerId
        ORDER BY j.createdAt DESC
    """)
    List<Jobs> findRecentJobsByEmployer(Long employerId);

    @Query("SELECT j.id FROM Jobs j WHERE j.postedBy.id = :employerId")
    List<Long> findJobIdsByEmployerId(@Param("employerId") Long employerId);

    // ==========================================
    // 🧮 Các hàm đếm phục vụ Dashboard
    // ==========================================

    // ✅ 1️⃣ Đếm tổng số job của employer
    @Query("""
        SELECT COUNT(j) FROM Jobs j
        WHERE j.postedBy.id = :employerId
    """)
    long countByEmployerId(@Param("employerId") Long employerId);

    // ✅ 2️⃣ Đếm job theo trạng thái (OPEN, CLOSED, v.v.)
    @Query("""
        SELECT COUNT(j) FROM Jobs j
        WHERE j.postedBy.id = :employerId
        AND j.status = :status
    """)
    long countByEmployerIdAndStatus(@Param("employerId") Long employerId,
                                    @Param("status") JobStatus status);

    // ✅ 3️⃣ Đếm job được tạo trong khoảng thời gian
    @Query("""
        SELECT COUNT(j) FROM Jobs j
        WHERE j.postedBy.id = :employerId
        AND j.createdAt BETWEEN :startDate AND :endDate
    """)
    long countByPostedBy_IdAndCreatedAtBetween(@Param("employerId") Long employerId,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate);

    // ✅ 4️⃣ Đếm job theo trạng thái và thời gian (nếu cần chi tiết hơn)
    @Query("""
        SELECT COUNT(j) FROM Jobs j
        WHERE j.postedBy.id = :employerId
        AND j.status = :status
        AND j.createdAt BETWEEN :startDate AND :endDate
    """)
    long countByEmployerIdAndStatusAndCreatedAtBetween(@Param("employerId") Long employerId,
                                                       @Param("status") JobStatus status,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);

    // === Cho Tab "Dashboard" ===
    long countByStatus(JobStatus status);

    @Query(value = """
    SELECT DATE_FORMAT(j.createdAt, '%Y-%m') AS month, COUNT(j.id) AS count
    FROM jobs j
    WHERE j.createdAt >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY DATE_FORMAT(j.createdAt, '%Y-%m')
    ORDER BY month ASC
""", nativeQuery = true)
    List<Object[]> findJobGrowthLast6Months();


    // === Cho Tab "Job Management" (Lọc) ===
    Page<Jobs> findByStatus(JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Jobs j LEFT JOIN FETCH j.jobApplications WHERE j.id = :id")
    Optional<Jobs> findJobWithApplications(@Param("id") Long id);


    // ✅ Tìm theo title hoặc industry name
    List<Jobs> findByTitleContainingIgnoreCaseOrIndustry_NameContainingIgnoreCase(String title, String industryName);

    List<Jobs> findByIndustryId(Long industryId);

    List<Jobs> findByLocationIgnoreCase(String location);

    List<Jobs> findByIndustryIdAndLocationIgnoreCase(Long industryId, String location);

    @Query("SELECT j FROM Jobs j WHERE j.visible = CASE WHEN :visible = 1 THEN true ELSE false END")
    List<Jobs> findByVisible(@Param("visible") int visible);

    long countByPostedBy_IdAndVisibleTrue(Long employerId);
    List<Jobs> findByPostedBy_IdAndVisibleFalse(Long employerId);

    @Query("""
    SELECT DISTINCT j FROM Jobs j
    LEFT JOIN Report r ON r.reportedItemId = j.id AND r.reportedItemType = com.example.JobPortal.enums.ReportType.JOB
    WHERE j.postedBy.id = :employerId
    """)
    List<Jobs> findJobsWithReportsByEmployer(@Param("employerId") Long employerId);



}


package com.example.JobPortal.repository;

import com.example.JobPortal.enums.ApplicationStatus;
import com.example.JobPortal.model.Applications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Applications, Long> {

    List<Applications> findByCandidate_Id(Long candidateId);
    List<Applications> findByJob_Id(Long jobId);
    Optional<Applications> findByCandidate_IdAndJob_Id(Long candidateId, Long jobId);
    List<Applications> findByCandidate_IdAndStatus(Long candidateId, Enum status);
    List<Applications> findByCandidateId(Long candidateId);

    // --- PHƯƠNG THỨC MỚI HỖ TRỢ PHÂN TRANG CHO EMPLOYER ---

    // 1. Lấy tất cả Applications theo Employer ID (Không lọc)
    Page<Applications> findByJob_PostedBy_Id(Long employerId, Pageable pageable);

    // 2. Lấy Applications theo Employer ID và Status
    Page<Applications> findByJob_PostedBy_IdAndStatus(Long employerId, ApplicationStatus status, Pageable pageable);

    // 3. Lấy Applications theo Employer ID và Job ID
    Page<Applications> findByJob_PostedBy_IdAndJob_Id(Long employerId, Long jobId, Pageable pageable);

    // 4. Lấy Applications theo Employer ID, Job ID và Status
    Page<Applications> findByJob_PostedBy_IdAndJob_IdAndStatus(Long employerId, Long jobId, ApplicationStatus status, Pageable pageable);

    // 🔹 Ứng tuyển gần đây của employer
    @Query("""
        SELECT a FROM Applications a
        WHERE a.job.postedBy.id = :employerId
        ORDER BY a.appliedAt DESC
    """)
    List<Applications> findRecentApplicationsByEmployerId(@Param("employerId") Long employerId);

    // 🔹 Tổng số ứng tuyển của employer
    @Query("""
        SELECT COUNT(a) FROM Applications a
        WHERE a.job.postedBy.id = :employerId
    """)
    int countByEmployerId(@Param("employerId") Long employerId);

    @Query("""
        SELECT COUNT(a) FROM Applications a
        WHERE a.job.postedBy.id = :employerId
        AND a.status = :status
    """)
    int countByEmployerIdAndStatus(@Param("employerId") Long employerId,
                                   @Param("status") ApplicationStatus status);

    // 🔹 Tổng số ứng tuyển trong khoảng thời gian (dùng để tính % tăng trưởng)
    @Query("""
        SELECT COUNT(a) FROM Applications a
        WHERE a.job.postedBy.id = :employerId
        AND a.appliedAt BETWEEN :startDate AND :endDate
    """)
    long countByEmployerIdAndAppliedAtBetween(@Param("employerId") Long employerId,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);

    // 🔹 Tổng số ứng tuyển có trạng thái cụ thể trong khoảng thời gian (ví dụ: ACCEPTED)
    @Query("""
        SELECT COUNT(a) FROM Applications a
        WHERE a.job.postedBy.id = :employerId
        AND a.status = :status
        AND a.appliedAt BETWEEN :startDate AND :endDate
    """)
    long countByEmployerIdAndStatusAndAppliedAtBetween(@Param("employerId") Long employerId,
                                                       @Param("status") ApplicationStatus status,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);

    // 🔹 Thống kê ứng tuyển theo tháng (dùng cho biểu đồ)
    @Query("""
        SELECT FUNCTION('MONTH', a.appliedAt) AS month, COUNT(a.id) AS total
        FROM Applications a
        WHERE a.job.postedBy.id = :employerId
        GROUP BY FUNCTION('MONTH', a.appliedAt)
        ORDER BY FUNCTION('MONTH', a.appliedAt)
    """)
    List<Object[]> getMonthlyApplicationStats(@Param("employerId") Long employerId);




}

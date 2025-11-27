package com.example.JobPortal.controller;

import com.example.JobPortal.dto.EmployerDashboardResponse;
import com.example.JobPortal.dto.JobDto;
import com.example.JobPortal.enums.ApplicationStatus;
import com.example.JobPortal.model.EmployerProfiles;
import com.example.JobPortal.repository.ApplicationRepository;
import com.example.JobPortal.repository.EmployerProfilesRepository;
import com.example.JobPortal.repository.JobRepository;
import com.example.JobPortal.service.itf.EmailService;
import com.example.JobPortal.service.EmployerDashboardService;
import com.example.JobPortal.service.itf.JobService;
import com.example.JobPortal.service.itf.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employers")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "employer-controller", description = "Quản lý thông tin nhà tuyển dụng")
public class EmployerDashboardController {

    private final EmployerDashboardService dashboardService;
    private final JobService jobService;
    private final JobRepository jobRepository;
    private final EmployerProfilesRepository employerProfilesRepository;
    private final ReportService reportService;
    private final EmailService emailService;
    private final ApplicationRepository  applicationRepository;

    // ✅ 1️⃣ Dashboard tổng hợp
    @GetMapping("/{userId}/dashboard")
    public ResponseEntity<EmployerDashboardResponse> getDashboard(@PathVariable Long userId) {
        EmployerDashboardResponse response = dashboardService.getDashboardData(userId);
        Long employerId = dashboardService.getEmployerIdFromUser(userId);
        response.setReportedJobsCount(jobRepository.countByPostedBy_IdAndVisibleTrue(employerId));
        return ResponseEntity.ok(response);
    }

    // ✅ 2️⃣ Tổng số job
    @GetMapping("/{userId}/total-jobs")
    public ResponseEntity<Integer> getTotalJobs(@PathVariable Long userId) {
        Long employerId = dashboardService.getEmployerIdFromUser(userId);
        return ResponseEntity.ok(dashboardService.getTotalJobs(employerId));
    }

    // ✅ 3️⃣ Tổng số lượt xem
    @GetMapping("/{userId}/total-views")
    public ResponseEntity<Integer> getTotalViews(@PathVariable Long userId) {
        Long employerId = dashboardService.getEmployerIdFromUser(userId);
        return ResponseEntity.ok(dashboardService.getTotalViews(employerId));
    }

    // ✅ 4️⃣ Tổng số ứng tuyển
    @GetMapping("/{userId}/total-applications")
    public ResponseEntity<Integer> getTotalApplications(@PathVariable Long userId) {
        Long employerId = dashboardService.getEmployerIdFromUser(userId);
        return ResponseEntity.ok(dashboardService.getTotalApplications(employerId));
    }

    // ✅ 5️⃣ Job gần đây
    @GetMapping("/{userId}/recent-jobs")
    public ResponseEntity<List<JobDto>> getRecentJobs(@PathVariable Long userId) {
        Long employerId = dashboardService.getEmployerIdFromUser(userId);
        return ResponseEntity.ok(dashboardService.getRecentJobs(employerId));
    }

    // ✅ 6️⃣ Ứng tuyển gần đây
    @GetMapping("/{userId}/recent-applications")
    public ResponseEntity<List<Map<String, Object>>> getRecentApplications(@PathVariable Long userId) {
        Long employerId = dashboardService.getEmployerIdFromUser(userId);
        return ResponseEntity.ok(dashboardService.getRecentApplications(employerId));
    }

    // ✅ 7️⃣ Biểu đồ lượt xem theo tháng
    @GetMapping("/{userId}/views-stats")
    public ResponseEntity<List<Map<String, Object>>> getViewsData(@PathVariable Long userId) {
        Long employerId = dashboardService.getEmployerIdFromUser(userId);
        return ResponseEntity.ok(dashboardService.getViewsData(employerId));
    }

    // ✅ 8️⃣ Biểu đồ ứng tuyển theo tháng
    @GetMapping("/{userId}/applications-stats")
    public ResponseEntity<List<Map<String, Object>>> getApplicationsData(@PathVariable Long userId) {
        Long employerId = dashboardService.getEmployerIdFromUser(userId);
        return ResponseEntity.ok(dashboardService.getApplicationsData(employerId));
    }

    // ✅ 9️⃣ Lấy TẤT CẢ Jobs của Employer (phục vụ trang quản lý)
    @GetMapping("/{userId}/jobs")
    public ResponseEntity<Page<JobDto>> getAllJobsByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        // 🔹 Tự động tìm employerId tương ứng với userId
        Long employerId = employerProfilesRepository.findByUserId(userId)
                .map(EmployerProfiles::getId)
                .orElseThrow(() -> new RuntimeException("Employer not found for user ID: " + userId));

        Page<JobDto> jobsPage = jobService.getEmployerJobs(employerId, status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(jobsPage);
    }


    // ✅ 10️⃣ Thay đổi trạng thái Job (Pause/Activate/Close)
    @PatchMapping("/jobs/{jobId}/status")
    public ResponseEntity<JobDto> updateJobStatus(
            @PathVariable Long jobId,
            @RequestBody Map<String, String> statusUpdate
    ) {
        String newStatus = statusUpdate.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().build();
        }
        // TODO: Cần kiểm tra quyền sở hữu Job (Authorization) trong Service!
        JobDto updatedJob = jobService.updateJobStatus(jobId, newStatus);
        return ResponseEntity.ok(updatedJob);
    }

    @GetMapping("/{userId}/applications")
    public ResponseEntity<Page<Map<String, Object>>> getAllApplicationsByUser(
            @PathVariable Long userId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long employerId = dashboardService.getEmployerIdFromUser(userId);
        Page<Map<String, Object>> result = dashboardService.getAllApplications(employerId, status, jobId, page, size);
        return ResponseEntity.ok(result);
    }

    // ✅ 11️⃣ Cập nhật trạng thái ứng tuyển (Accepted / Rejected / Pending)
    @PatchMapping("/applications/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody Map<String, String> request
    ) {
        String newStatus = request.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing status"));
        }

        try {
            // ✅ Chuyển string sang enum
            ApplicationStatus statusEnum = ApplicationStatus.valueOf(newStatus.toUpperCase());

            // ✅ Cập nhật trạng thái ứng tuyển trong DB
            Map<String, Object> updated = dashboardService.updateApplicationStatus(applicationId, statusEnum);

            // ✅ Sau khi update, lấy thông tin thật từ DB để gửi mail
            try {
                var applicationOpt = applicationRepository.findById(applicationId);
                if (applicationOpt.isPresent()) {
                    var application = applicationOpt.get();
                    String candidateEmail = application.getCandidate().getUser().getEmail();
                    String jobTitle = application.getJob().getTitle();

                    // ✅ Gửi mail kết quả ứng tuyển
                    boolean approved = (statusEnum == ApplicationStatus.ACCEPTED);
                    emailService.sendCandidateApplicationResult(candidateEmail, jobTitle, approved);

                    System.out.println("✅ Email sent to candidate: " + candidateEmail + " for job: " + jobTitle);
                } else {
                    System.err.println("⚠️ Application not found when sending result email (ID: " + applicationId + ")");
                }
            } catch (Exception ex) {
                System.err.println("⚠️ Failed to send candidate result email: " + ex.getMessage());
            }

            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value: " + newStatus));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }




}

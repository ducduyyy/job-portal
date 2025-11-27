package com.example.JobPortal.controller;

import com.example.JobPortal.dto.*;
// ⭐️ Import DTO mới
import com.example.JobPortal.dto.AdminUserViewDto;
import com.example.JobPortal.enums.*;
import com.example.JobPortal.service.admin.AdminDashboardService;
import com.example.JobPortal.service.UserService;
import com.example.JobPortal.service.itf.EmailService;
import com.example.JobPortal.service.itf.JobService;
import com.example.JobPortal.service.itf.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "admin-controller", description = "Quản lý thông tin của người dùng")
public class AdminController {

    private final AdminDashboardService dashboardService;
    private final UserService userService;
    private final JobService jobService;
    private final ReportService reportService;
    private final EmailService emailService;

    // === 1. API CHO TAB "DASHBOARD" ===
    // (Giữ nguyên không đổi)
    @GetMapping("/stats")
    @PreAuthorize("permitAll()")
    public ResponseEntity<AdminDashboardStatsDto> getStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @PostMapping("/init-sample-data")
    public ResponseEntity<AdminDashboardStatsDto> initSampleData() {
        return ResponseEntity.ok(dashboardService.initializeSampleData());
    }

    // === 2. API CHO TAB "USER MANAGEMENT" (ĐÃ CẬP NHẬT) ===

    @GetMapping("/users")
    public ResponseEntity<Page<AdminUserViewDto>> getAllUsers( // ⭐️ Trả về DTO an toàn
                                                               @RequestParam(required = false) Role role,
                                                               @RequestParam(required = false) AccountStatus status,
                                                               Pageable pageable) {
        // ⭐️ Gọi service đã cập nhật
        Page<AdminUserViewDto> users = userService.getAllUsers(role, status, pageable);
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request
    ) {
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            return ResponseEntity.badRequest().body("Missing status value");
        }

        AccountStatus newStatus;
        try {
            newStatus = AccountStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status: " + request.getStatus());
        }

        // Cập nhật trạng thái trong DB
        AdminUserViewDto updatedUser = userService.updateUserStatus(userId, newStatus);

        // ✅ Gửi mail sau khi update trạng thái
        try {
            String email = updatedUser.getEmail();
            String fullName = updatedUser.getUsername() != null ? updatedUser.getUsername() : "User";

            if (newStatus == AccountStatus.BLOCKED) {
                emailService.sendAccountBlockedMail(
                        email,
                        "Your account has been blocked by the administrator due to a policy violation or suspicious activity."
                );
            } else if (newStatus == AccountStatus.DELETED) {
                emailService.sendAccountDeletedMail(
                        email,
                        "Your account has been permanently deleted by the administrator."
                );
            }

            System.out.println("✅ Admin sent mail to " + email + " (" + newStatus + ")");
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send mail when updating user status: " + e.getMessage());
        }

        return ResponseEntity.ok(updatedUser);
    }


    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/employer/{employerId}/jobs")
    public ResponseEntity<List<JobDto>> getJobsByEmployer(@PathVariable Long employerId) {
        return ResponseEntity.ok(jobService.getJobsByEmployer(employerId));
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobDto>> getAllJobsForAdmin(
            @RequestParam(required = false) JobStatus status,
            Pageable pageable) {
        Page<JobDto> jobsPage = jobService.getAllJobsForAdmin(status, pageable);
        return ResponseEntity.ok(jobsPage);
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<JobDto> getJobById(@PathVariable Long jobId) {
        Optional<JobDto> jobOpt = jobService.getJobById(jobId);

        if (jobOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        JobDto job = jobOpt.get();

        return ResponseEntity.ok(job);
    }


    @PutMapping("/jobs/{jobId}/status")
    public ResponseEntity<JobDto> updateJobStatus(
            @PathVariable Long jobId,
            @RequestParam String status) { // Nhận String cho linh hoạt
        // Sử dụng lại hàm "updateJobStatus" của bạn
        JobDto updatedJob = jobService.updateJobStatus(jobId, status);
        return ResponseEntity.ok(updatedJob);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }


}
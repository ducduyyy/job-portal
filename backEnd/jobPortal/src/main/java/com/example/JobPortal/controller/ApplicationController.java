package com.example.JobPortal.controller;

import com.example.JobPortal.dto.ApplicationDto;
import com.example.JobPortal.model.Applications;
import com.example.JobPortal.repository.ApplicationRepository;
import com.example.JobPortal.service.itf.ApplicationService;
import com.example.JobPortal.service.itf.EmailService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "application-controller", description = "Quản lý thông tin ứng tuyển của ứng viên")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final ApplicationRepository applicationRepository;
    private final EmailService emailService;

    @PostMapping
    public ResponseEntity<Applications> apply(@RequestBody Applications application) {
        Applications saved = applicationService.apply(application);

        try {
            String candidateEmail = saved.getCandidate().getUser().getEmail();
            String employerEmail = saved.getJob().getPostedBy().getUser().getEmail();
            String jobTitle = saved.getJob().getTitle();
            String candidateName = saved.getCandidate().getFullName();

            emailService.sendCandidateApplicationConfirmationMail(candidateEmail, jobTitle);
            emailService.sendEmployerNewApplicationMail(employerEmail, jobTitle, candidateName);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send application mail: " + e.getMessage());
        }

        return ResponseEntity.ok(saved);
    }

    // ✅ Quick apply (CV mới nhất)
    @PostMapping("/quick-apply")
    public ResponseEntity<Applications> quickApply(
            @RequestParam Long candidateId,
            @RequestParam Long jobId
    ) {
        Applications application = applicationService.quickApply(candidateId, jobId);

        try {
            String candidateEmail = application.getCandidate().getUser().getEmail();
            String employerEmail = application.getJob().getPostedBy().getUser().getEmail();
            String jobTitle = application.getJob().getTitle();
            String candidateName = application.getCandidate().getFullName();

            emailService.sendCandidateAppliedMail(candidateEmail, jobTitle);
            emailService.sendEmployerNewApplicationMail(employerEmail, jobTitle, candidateName);

        } catch (Exception e) {
            System.err.println("⚠️ Failed to send quick apply mail: " + e.getMessage());
        }

        return ResponseEntity.ok(application);
    }


    // ✅ Apply chọn CV hoặc upload mới
    @PostMapping("/apply")
    public ResponseEntity<Applications> applyWithCv(
            @RequestParam Long candidateId,
            @RequestParam Long jobId,
            @RequestParam(required = false) String existingCv,
            @RequestParam(required = false) MultipartFile newCv
    ) {
        Applications application = applicationService.applyWithCv(candidateId, jobId, existingCv, newCv);

        try {
            String candidateEmail = application.getCandidate().getUser().getEmail();
            String employerEmail = application.getJob().getPostedBy().getUser().getEmail();
            String jobTitle = application.getJob().getTitle();
            String candidateName = application.getCandidate().getFullName();

            emailService.sendCandidateApplicationConfirmationMail(candidateEmail, jobTitle);

            emailService.sendEmployerNewApplicationMail(employerEmail, jobTitle, candidateName);

        } catch (Exception e) {
            System.err.println("⚠️ Failed to send application mail: " + e.getMessage());
        }

        return ResponseEntity.ok(application);
    }



    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Applications>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId));
    }

    @GetMapping("/check-applied")
    public ResponseEntity<Boolean> checkApplied(
            @RequestParam Long candidateId,
            @RequestParam Long jobId) {
        boolean exists = applicationRepository.findByCandidate_IdAndJob_Id(candidateId, jobId).isPresent();
        return ResponseEntity.ok(exists);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<ApplicationDto>> getApplicationsByCandidate(@PathVariable Long candidateId) {
        List<ApplicationDto> applications = applicationService.getApplicationsByCandidate(candidateId);
        return ResponseEntity.ok(applications);
    }

    @DeleteMapping("/cancel")
    public ResponseEntity<String> cancelApplication(
            @RequestParam Long candidateId,
            @RequestParam Long jobId) {
        applicationService.cancelApplication(candidateId, jobId);
        return ResponseEntity.ok("Application canceled successfully");
    }

    // ✅ Lấy chi tiết một Application
    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationDto> getApplicationDetail(@PathVariable Long applicationId) {
        return applicationService.getApplicationDetail(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ Endpoint tải CV (cần Authorization: chỉ Employer của Job đó mới được tải)
    @GetMapping("/{applicationId}/download-cv")
    public ResponseEntity<Resource> downloadCv(@PathVariable Long applicationId) {
        // 1. Service phải tìm Application và kiểm tra Authorization (quyền của Employer)
        // 2. Trả về Resource (CV file)
        return applicationService.downloadCv(applicationId);
    }

}

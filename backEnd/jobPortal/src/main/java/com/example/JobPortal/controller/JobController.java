package com.example.JobPortal.controller;

import com.example.JobPortal.dto.JobDto;
import com.example.JobPortal.repository.EmployerProfilesRepository;
import com.example.JobPortal.service.itf.EmailService;
import com.example.JobPortal.service.itf.JobService;
import com.example.JobPortal.service.JobSkillService;
import com.example.JobPortal.enums.ExperienceLevels;
import com.example.JobPortal.enums.JobType;
import com.example.JobPortal.service.util.FileStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Tag(name = "job-controller", description = "Quản lý thông tin của các công việc đã được đăng lên")
public class JobController {

    private final JobService jobService;
    private final JobSkillService jobSkillService;
    private final FileStorageService fileStorageService;
    private final EmailService emailService;
    private final EmployerProfilesRepository  employerProfilesRepository;


    // ✅ Tạo hoặc update Job
    @PostMapping
    public ResponseEntity<JobDto> createOrUpdateJob(@RequestBody JobDto jobDto) {
        JobDto savedJob = jobService.createOrUpdateJob(jobDto);

        // 🔹 Gửi mail cho Employer khi đăng job thành công
        try {
            String employerEmail = savedJob.getCompanyEmail();
            if (employerEmail != null && !employerEmail.isBlank()) {
                emailService.sendJobCreatedMail(employerEmail, savedJob.getTitle());
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send job creation mail: " + e.getMessage());
        }

        return ResponseEntity.ok(savedJob);
    }

    @PostMapping("/create-with-image")
    public ResponseEntity<JobDto> createJobWithImage(
            @RequestPart("job") JobDto jobDto,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        if (file != null && !file.isEmpty()) {
            String fileUrl = fileStorageService.saveJobImage(file, jobDto.getPostedById());
            jobDto.setJobIMG(fileUrl);
        }

        JobDto savedJob = jobService.createOrUpdateJob(jobDto);

        // ✅ Gửi mail khi upload job thành công
        try {
            var employer = employerProfilesRepository.findById(jobDto.getPostedById())
                    .orElseThrow(() -> new RuntimeException("Employer not found"));
            String employerEmail = employer.getUser().getEmail();

            emailService.sendJobCreatedMail(employerEmail, savedJob.getTitle());

        } catch (Exception e) {
            System.err.println("⚠️ Failed to send email for create-with-image: " + e.getMessage());
        }

        return ResponseEntity.ok(savedJob);
    }



    // ✅ Lấy tất cả jobs
    @GetMapping
    public ResponseEntity<List<JobDto>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDto> getJobById(@PathVariable Long id,
                                             @RequestParam(required = false) Long viewerId) {
        Optional<JobDto> jobOpt = jobService.getJobById(id);

        if (jobOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        JobDto job = jobOpt.get();

        // Nếu người xem không phải chủ bài → tăng view
        if (viewerId == null || !viewerId.equals(job.getPostedById())) {
            jobService.incrementViewCount(id);
        }

        return ResponseEntity.ok(job);
    }

    // ✅ Lấy jobs theo employer
    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<JobDto>> getJobsByEmployer(@PathVariable Long employerId) {
        return ResponseEntity.ok(jobService.getJobsByEmployer(employerId));
    }

    // ✅ Xoá job
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        Optional<JobDto> jobOpt = jobService.getJobById(id);
        jobService.deleteJob(id);

        // 🔹 Gửi mail xác nhận xóa job
        jobOpt.ifPresent(job -> {
            try {
                String employerEmail = job.getCompanyEmail();
                if (employerEmail != null && !employerEmail.isBlank()) {
                    emailService.sendJobDeletedMail(employerEmail, job.getTitle());
                }
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send job deletion mail: " + e.getMessage());
            }
        });

        return ResponseEntity.noContent().build();
    }

    // ✅ Featured
    @PatchMapping("/{id}/featured")
    public ResponseEntity<JobDto> updateFeatured(@PathVariable Long id,
                                                 @RequestParam boolean featured) {
        return ResponseEntity.ok(jobService.updateFeaturedStatus(id, featured));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<JobDto>> getFeaturedJobs() {
        return ResponseEntity.ok(jobService.getFeaturedJobs());
    }

    // ✅ Lấy job types (tách riêng, không conflict với /{id})
    @GetMapping("/types")
    public ResponseEntity<List<String>> getJobTypes() {
        List<String> types = Arrays.stream(JobType.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(types);
    }

    // ✅ Lấy experience levels (tách riêng)
    @GetMapping("/experience-levels")
    public ResponseEntity<List<String>> getExperienceLevels() {
        List<String> levels = Arrays.stream(ExperienceLevels.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(levels);
    }

    // ✅ Upload ảnh Job theo employerId
    @PostMapping("/upload-image/{employerId}")
    public ResponseEntity<String> uploadJobImage(
            @PathVariable Long employerId,
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        String fileUrl = fileStorageService.saveJobImage(file, employerId);
        return ResponseEntity.ok(fileUrl);
    }

    // ✅ Cập nhật job theo ID (edit job)
    @PutMapping("/{id}")
    public ResponseEntity<JobDto> updateJob(
            @PathVariable Long id,
            @RequestBody JobDto jobDto
    ) {
        JobDto updatedJob = jobService.updateJob(id, jobDto);
        return ResponseEntity.ok(updatedJob);
    }

    // ✅ Lấy job theo trạng thái visible
    @GetMapping("/visible/{visible}")
    public ResponseEntity<List<JobDto>> getJobsByVisibility(@PathVariable int visible) {
        return ResponseEntity.ok(jobService.getJobsByVisibility(visible));
    }

    // ✅ Lấy job đang hoạt động (visible = 0)
    @GetMapping("/active")
    public ResponseEntity<List<JobDto>> getActiveJobs() {
        return ResponseEntity.ok(jobService.getJobsByVisibility(0));
    }

    // ✅ Lấy job bị ẩn do report (visible = 1)
    @GetMapping("/hidden")
    public ResponseEntity<List<JobDto>> getHiddenJobs() {
        return ResponseEntity.ok(jobService.getJobsByVisibility(1));
    }


}

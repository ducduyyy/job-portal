package com.example.JobPortal.service.impl;

import com.example.JobPortal.dto.ApplicationDto;
import com.example.JobPortal.enums.ApplicationStatus;
import com.example.JobPortal.mapper.ApplicationMapper;
import com.example.JobPortal.model.*;
import com.example.JobPortal.repository.ApplicationRepository;
import com.example.JobPortal.service.*;
import com.example.JobPortal.service.itf.ApplicationService;
import com.example.JobPortal.service.itf.JobService;
import com.example.JobPortal.service.util.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateProfilesService candidateProfilesService;
    private final JobService jobService;
    private final FileStorageService fileStorageService;
    private final ApplicationMapper applicationMapper;


    @Override
    public Applications apply(Applications application) {
        // Nên set status mặc định khi apply
        application.setStatus(ApplicationStatus.PENDING);
        return applicationRepository.save(application);
    }

    @Override
    public List<ApplicationDto> getApplicationsByCandidate(Long candidateId) {
        return applicationRepository.findByCandidate_Id(candidateId)
                .stream()
                .map(applicationMapper::toDto)
                .toList();
    }

    @Override
    public void cancelApplication(Long candidateId, Long jobId) {
        Applications app = applicationRepository
                .findByCandidate_IdAndJob_Id(candidateId, jobId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        applicationRepository.delete(app);
    }



    @Override
    public List<Applications> getApplicationsByJob(Long jobId) {
        return applicationRepository.findByJob_Id(jobId);
    }

    // ✅ Quick apply: dùng CV mới nhất trong profile
    @Override
    public Applications quickApply(Long candidateId, Long jobId) {
        CandidateProfiles profile = candidateProfilesService
                .getByUserId(candidateId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        List<String> cvs = profile.getCvs();
        if (cvs == null || cvs.isEmpty())
            throw new RuntimeException("No CV found for this candidate");

        String latestCv = cvs.get(cvs.size() - 1); // CV mới nhất

        Applications app = new Applications();
        app.setCandidate(profile);
        app.setJob(jobService.getJobEntityById(jobId));
        app.setCvUrl(latestCv);
        app.setStatus(ApplicationStatus.PENDING);

        return applicationRepository.save(app);
    }

    // ✅ Apply chọn CV hoặc upload mới
//    @Override
//    public Applications applyWithCv(Long candidateId, Long jobId, String existingCv, MultipartFile newCv) {
//        CandidateProfiles profile = candidateProfilesService
//                .getByUserId(candidateId)
//                .orElseThrow(() -> new RuntimeException("Profile not found"));
//
//        String cvUrl = existingCv;
//        if (newCv != null && !newCv.isEmpty()) {
//            cvUrl = fileStorageService.saveFile(newCv, candidateId, "cvs");
//            profile.getCvs().add(cvUrl);
//            candidateProfilesService.save(profile);
//        }
//
//        Applications app = new Applications();
//        app.setCandidate(profile);
//        app.setJob(jobService.getJobEntityById(jobId));
//        app.setCvUrl(cvUrl);
//        app.setStatus(ApplicationStatus.PENDING);
//
//        return applicationRepository.save(app);
//    }

    @Override
    public Optional<ApplicationDto> getApplicationDetail(Long applicationId) {
        return applicationRepository.findById(applicationId)
                .map(applicationMapper::toDto);
    }

    @Override
    public Applications applyWithCv(Long candidateId, Long jobId, String existingCv, MultipartFile newCv) {
        CandidateProfiles profile = candidateProfilesService
                .getByUserId(candidateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));

        // 1. Khởi tạo và lưu Application để lấy ID
        Applications app = new Applications();
        app.setCandidate(profile);
        app.setJob(jobService.getJobEntityById(jobId)); // Giả định service này có phương thức trả về entity
        app.setStatus(ApplicationStatus.PENDING);

        // Cần lưu trước để có ID cho đường dẫn upload CV mới
        Applications savedApp = applicationRepository.save(app);

        String cvUrl = existingCv;

        // 2. Nếu có CV mới được upload, tiến hành lưu file bằng ID vừa tạo
        if (newCv != null && !newCv.isEmpty()) {
            // ✅ SỬ DỤNG PHƯƠNG THỨC LƯU CV MỚI
            cvUrl = fileStorageService.saveApplicationCv(newCv, savedApp.getId());

            // Cập nhật lại Profile CV list
            if (profile.getCvs() != null) {
                profile.getCvs().add(cvUrl);
            }
            candidateProfilesService.save(profile);
        }

        if (cvUrl == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CV file or link must be provided.");
        }

        // 3. Cập nhật lại Application với URL CV đã có ID
        savedApp.setCvUrl(cvUrl);
        return applicationRepository.save(savedApp);
    }

    @Override
    public Page<ApplicationDto> getApplicationsByEmployer(Long employerId, String status, Long jobId, int page, int size) {

        // 1. Setup Pageable và Sort (mặc định sort theo thời gian nộp hồ sơ giảm dần)
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<Applications> applicationsPage;

        boolean filterByStatus = status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL");
        boolean filterByJob = jobId != null && jobId > 0;

        // 2. Xử lý logic lọc và gọi Repository
        if (filterByStatus) {
            try {
                ApplicationStatus appStatus = ApplicationStatus.valueOf(status.toUpperCase());
                if (filterByJob) {
                    // Lọc theo Job ID và Status
                    applicationsPage = applicationRepository.findByJob_PostedBy_IdAndJob_IdAndStatus(employerId, jobId, appStatus, pageable);
                } else {
                    // Lọc theo Status
                    applicationsPage = applicationRepository.findByJob_PostedBy_IdAndStatus(employerId, appStatus, pageable);
                }
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid application status: " + status);
            }
        } else if (filterByJob) {
            // Lọc theo Job ID (và Status = ALL)
            applicationsPage = applicationRepository.findByJob_PostedBy_IdAndJob_Id(employerId, jobId, pageable);
        } else {
            // Không lọc (Lấy tất cả ứng viên của Employer)
            applicationsPage = applicationRepository.findByJob_PostedBy_Id(employerId, pageable);
        }

        // 3. Map kết quả Page sang Page<ApplicationDto>
        return applicationsPage.map(applicationMapper::toDto);
    }

    @Override
    public ResponseEntity<Resource> downloadCv(Long applicationId) {
        Applications app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found"));

        // TODO: BƯỚC QUAN TRỌNG: KIỂM TRA PHÂN QUYỀN (AUTHORIZATION) tại đây

        String cvUrl = app.getCvUrl();
        if (cvUrl == null) {
            return ResponseEntity.notFound().build();
        }

        // ✅ SỬ DỤNG PHƯƠNG THỨC TẢI FILE MỚI
        Resource resource = fileStorageService.loadFileAsResource(cvUrl);

        if (resource == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CV file not found on server.");
        }

        String filename = resource.getFilename();
        if (filename == null) {
            // Đặt tên file mặc định nếu không lấy được
            filename = "CV_" + applicationId + ".pdf";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/pdf"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

}

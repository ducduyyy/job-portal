package com.example.JobPortal.service.itf;

import com.example.JobPortal.dto.ApplicationDto;
import com.example.JobPortal.model.Applications;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface ApplicationService {
    Applications apply(Applications application);
    List<ApplicationDto> getApplicationsByCandidate(Long candidateId);
    List<Applications> getApplicationsByJob(Long jobId);
    void cancelApplication(Long candidateId, Long jobId);
    Applications quickApply(Long candidateId, Long jobId);
    Applications applyWithCv(Long candidateId, Long jobId, String existingCv, MultipartFile newCv);
    Optional<ApplicationDto> getApplicationDetail(Long applicationId);
    ResponseEntity<Resource> downloadCv(Long applicationId);
    Page<ApplicationDto> getApplicationsByEmployer(Long employerId, String status, Long jobId, int page, int size);
}

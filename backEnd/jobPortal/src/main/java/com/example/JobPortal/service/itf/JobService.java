package com.example.JobPortal.service.itf;

import com.example.JobPortal.dto.JobDto;
import com.example.JobPortal.dto.JobSearchCriteria;
import com.example.JobPortal.enums.JobStatus;
import com.example.JobPortal.model.Jobs;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface JobService {
    List<JobDto> getAllJobs();
//    Optional<Jobs> getJobEntityById(Long id);
    JobDto createOrUpdateJob(JobDto jobDto);
    JobDto updateFeaturedStatus(Long id, boolean featured);
    List<JobDto> getFeaturedJobs();
    Optional<JobDto> getJobById(Long id);
    Jobs getJobEntityById(Long jobId);
    // ✅ PHƯƠNG THỨC MỚI: Lấy tất cả Jobs của Employer (có thể lọc và phân trang)
    Page<JobDto> getEmployerJobs(Long employerId, String status, int page, int size, String sortBy, String sortDir);

    // ✅ PHƯƠNG THỨC MỚI: Cập nhật trạng thái Job (Pause/Activate)
    JobDto updateJobStatus(Long jobId, String status);
    List<JobDto> getJobsByEmployer(Long employerId);
    void incrementViewCount(Long jobId);
    JobDto updateJob(Long id, JobDto jobDto);
    void deleteJob(Long id);

    Page<JobDto> getAllJobsForAdmin(JobStatus status, Pageable pageable);

    List<JobDto> searchJobs(String keyword, String location);

    List<JobDto> findByIndustryId(Long industryId);

    List<JobDto> findByIndustryAndLocation(Long id, String s);

    List<JobDto> findByLocation(String s);

    List<JobDto> getJobsByVisibility(int visible);

    List<JobDto> searchJobsAdvanced(JobSearchCriteria criteria);
}

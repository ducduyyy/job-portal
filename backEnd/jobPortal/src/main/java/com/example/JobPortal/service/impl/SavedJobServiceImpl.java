package com.example.JobPortal.service.impl;

import com.example.JobPortal.dto.JobDto;
import com.example.JobPortal.model.*;
import com.example.JobPortal.repository.CandidateProfilesRepository;
import com.example.JobPortal.repository.SavedJobRepository;
import com.example.JobPortal.repository.JobRepository;
import com.example.JobPortal.service.itf.SavedJobService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SavedJobServiceImpl implements SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final CandidateProfilesRepository candidateProfilesRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional
    public SavedJob saveJob(Long candidateId, Long jobId) {
        CandidateProfiles candidate = candidateProfilesRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        Jobs job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Kiểm tra trùng lặp
        if (savedJobRepository.findByCandidateAndJob(candidate, job).isPresent()) {
            throw new RuntimeException("Job already saved by this candidate");
        }

        SavedJob savedJob = new SavedJob();
        savedJob.setCandidate(candidate);
        savedJob.setJob(job);
        return savedJobRepository.save(savedJob);
    }

    @Override
    @Transactional
    public void removeSavedJob(Long candidateId, Long jobId) {
        CandidateProfiles candidate = candidateProfilesRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
        Jobs job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        savedJobRepository.deleteByCandidateAndJob(candidate, job);
    }

    @Override
    public List<JobDto> getSavedJobsByCandidate(Long candidateId) {
        CandidateProfiles candidate = candidateProfilesRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        List<SavedJob> savedJobs = savedJobRepository.findByCandidate(candidate);

        return savedJobs.stream()
                .map(saved -> {
                    Jobs job = saved.getJob();
                    JobDto dto = new JobDto();
                    dto.setId(job.getId());
                    dto.setTitle(job.getTitle());
                    dto.setDescription(job.getDescription());
                    dto.setLocation(job.getLocation());
                    dto.setSalaryMin(job.getSalaryMin());
                    dto.setSalaryMax(job.getSalaryMax());
                    dto.setJobIMG(job.getJobIMG());
                    dto.setJobType(job.getJobType());
                    dto.setStatus(String.valueOf(job.getStatus()));
                    dto.setFeatured(job.getFeatured());
                    dto.setViewsCount(job.getViewsCount());
                    dto.setCreatedAt(job.getCreatedAt());
                    dto.setUpdatedAt(job.getUpdatedAt());

                    // Thêm industry info
                    if (job.getIndustry() != null) {
                        dto.setIndustryId(job.getIndustry().getId());
                        dto.setIndustryName(job.getIndustry().getName());
                    }

                    // Thêm postedBy info
                    if (job.getPostedBy() != null) {
                        dto.setPostedById(job.getPostedBy().getId());
                        dto.setPostedByName(job.getPostedBy().getUser().getUsername());
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }
}

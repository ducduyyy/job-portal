package com.example.JobPortal.service.itf;

import com.example.JobPortal.dto.JobDto;
import com.example.JobPortal.model.SavedJob;

import java.util.List;

public interface SavedJobService {
    SavedJob saveJob(Long candidateId, Long jobId);
    void removeSavedJob(Long candidateId, Long jobId);
    List<JobDto> getSavedJobsByCandidate(Long candidateId);
}

package com.example.JobPortal.repository;

import com.example.JobPortal.model.CandidateProfiles;
import com.example.JobPortal.model.SavedJob;
import com.example.JobPortal.model.Jobs;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    List<SavedJob> findByCandidate(CandidateProfiles candidate);
    Optional<SavedJob> findByCandidateAndJob(CandidateProfiles candidate, Jobs job);
    void deleteByCandidateAndJob(CandidateProfiles candidate, Jobs job);
}

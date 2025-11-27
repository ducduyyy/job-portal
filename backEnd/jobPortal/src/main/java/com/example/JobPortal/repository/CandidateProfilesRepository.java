package com.example.JobPortal.repository;

import com.example.JobPortal.model.CandidateProfiles;
import com.example.JobPortal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CandidateProfilesRepository extends JpaRepository<CandidateProfiles, Long> {
    Optional<CandidateProfiles> findByUserId(Long userId);
    Optional<CandidateProfiles> findByUser(User user);
}

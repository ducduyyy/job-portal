package com.example.JobPortal.repository;

import com.example.JobPortal.model.CandidateProfiles;
import com.example.JobPortal.model.EmployerProfiles;
import com.example.JobPortal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmployerProfilesRepository extends JpaRepository<EmployerProfiles, Long> {
    Optional<EmployerProfiles> findByUserId(Long userId);
    Optional<EmployerProfiles> findByUser(User user);

}

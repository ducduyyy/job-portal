package com.example.JobPortal.repository;

import com.example.JobPortal.model.Industry;
import com.example.JobPortal.model.Skills;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skills, Long> {
    Optional<Skills> findByName(String name);

    List<Skills> findByIndustry(Industry industry);
}


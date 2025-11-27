package com.example.JobPortal.repository;

import com.example.JobPortal.model.JobSkill;
import com.example.JobPortal.model.JobSkillId;
import com.example.JobPortal.model.Jobs;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobSkillRepository extends JpaRepository<JobSkill, JobSkillId> {
    List<JobSkill> findByJob(Optional<Jobs> job);
    void deleteAllByJob(Jobs job);
    List<JobSkill> findByJob_Id(Long jobId);

    @Modifying
    @Transactional
    @Query("DELETE FROM JobSkill js WHERE js.job.id = :jobId AND js.skill.id = :skillId")
    void deleteByJobIdAndSkillId(@Param("jobId") Long jobId, @Param("skillId") Long skillId);
}


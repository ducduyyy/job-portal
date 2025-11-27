package com.example.JobPortal.service;

import com.example.JobPortal.dto.JobSkillDto;
import com.example.JobPortal.model.JobSkill;
import com.example.JobPortal.model.JobSkillId;
import com.example.JobPortal.model.Jobs;
import com.example.JobPortal.model.Skills;
import com.example.JobPortal.repository.JobRepository;
import com.example.JobPortal.repository.JobSkillRepository;
import com.example.JobPortal.repository.SkillRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JobSkillService {

    private final JobSkillRepository jobSkillRepository;
    private final JobRepository jobRepository;
    private final SkillRepository skillRepository;

    public List<JobSkillDto> getSkillsByJob(Long jobId) {
        Jobs job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        return jobSkillRepository.findByJob(Optional.ofNullable(job))
                .stream()
                .map(js -> new JobSkillDto(
                        js.getJob().getId(),
                        js.getSkill().getId(),
                        js.getSkill().getName()
                ))
                .toList();
    }

    @Transactional
    public JobSkillDto addSkill(Long jobId, Long skillId) {
        Jobs job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Skills skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        // Kiểm tra nếu đã tồn tại
        JobSkillId id = new JobSkillId(jobId, skillId);
        if (jobSkillRepository.existsById(id)) {
            throw new RuntimeException("Skill already assigned to this job");
        }

        JobSkill jobSkill = new JobSkill();
        jobSkill.setId(id);
        jobSkill.setJob(job);
        jobSkill.setSkill(skill);

        jobSkillRepository.save(jobSkill);

        return new JobSkillDto(skill.getId(), skill.getName());
    }

    @Transactional
    public void deleteSkill(Long jobId, Long skillId) {
        JobSkillId id = new JobSkillId(jobId, skillId);
        if (!jobSkillRepository.existsById(id)) {
            throw new RuntimeException("JobSkill not found for given IDs");
        }
        jobSkillRepository.deleteById(id);
    }
}

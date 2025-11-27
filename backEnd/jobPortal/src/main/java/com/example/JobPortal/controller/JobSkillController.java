package com.example.JobPortal.controller;

import com.example.JobPortal.dto.JobSkillDto;
import com.example.JobPortal.service.JobSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobSkillController {

    private final JobSkillService jobSkillService;

    @GetMapping("/{jobId}/skills")
    public ResponseEntity<List<JobSkillDto>> getJobSkills(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobSkillService.getSkillsByJob(jobId));
    }

    @PostMapping("/{jobId}/skills")
    public ResponseEntity<JobSkillDto> addJobSkill(
            @PathVariable Long jobId,
            @RequestParam Long skillId
    ) {
        return ResponseEntity.ok(jobSkillService.addSkill(jobId, skillId));
    }

    @DeleteMapping("/{jobId}/skills/{skillId}")
    public ResponseEntity<Void> deleteJobSkill(
            @PathVariable Long jobId,
            @PathVariable Long skillId
    ) {
        jobSkillService.deleteSkill(jobId, skillId);
        return ResponseEntity.noContent().build();
    }
}

package com.example.JobPortal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobSkillDto {
    private Long jobId;
    private Long skillId;
    private String skillName;

    public JobSkillDto(Long id, String name) {
    }
}


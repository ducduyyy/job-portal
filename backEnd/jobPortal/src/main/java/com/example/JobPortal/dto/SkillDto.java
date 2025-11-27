package com.example.JobPortal.dto;

import com.example.JobPortal.model.Industry;
import com.example.JobPortal.model.Skills;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkillDto {
    private Long id;
    private String name;
    private String description;
    private Long industryId;


    public SkillDto(Skills skill) {
        this.id = skill.getId();
        this.name = skill.getName();
        this.description = skill.getDescription();
    }

    public SkillDto(Long id, String name, String description) {
    }
}


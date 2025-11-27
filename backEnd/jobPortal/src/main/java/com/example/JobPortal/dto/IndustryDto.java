package com.example.JobPortal.dto;

import com.example.JobPortal.model.Industry;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IndustryDto {
    private Long id;
    private String name;
    private List<SkillDto> skills;
    private Long jobCount;

    public IndustryDto(Industry industry) {
        this.id = industry.getId();
        this.name = industry.getName();
        this.skills = industry.getSkills() != null
                ? industry.getSkills().stream()
                .map(SkillDto::new) // convert từng Skill -> SkillDto
                .collect(Collectors.toList())
                : null;
    }

}

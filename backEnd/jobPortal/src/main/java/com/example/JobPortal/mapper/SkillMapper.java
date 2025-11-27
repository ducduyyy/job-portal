package com.example.JobPortal.mapper;

import com.example.JobPortal.dto.SkillDto;
import com.example.JobPortal.model.Skills;

public class SkillMapper {

    public static SkillDto toDto(Skills skill) {
        SkillDto dto = new SkillDto();
        dto.setId(skill.getId());
        dto.setName(skill.getName());
        dto.setDescription(skill.getDescription());
        dto.setIndustryId(skill.getIndustry() != null ? skill.getIndustry().getId() : null);
        return dto;
    }

    public static Skills toEntity(SkillDto dto) {
        Skills skill = new Skills();
        skill.setId(dto.getId());
        skill.setName(dto.getName());
        skill.setDescription(dto.getDescription());
        return skill;
    }
}

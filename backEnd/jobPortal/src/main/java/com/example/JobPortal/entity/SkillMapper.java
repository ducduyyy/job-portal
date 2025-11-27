package com.example.JobPortal.entity;

import com.example.JobPortal.dto.SkillDto;
import com.example.JobPortal.model.Skills;

public class SkillMapper {

    public static SkillDto toDto(Skills skill) {
        return new SkillDto(skill.getId(), skill.getName(), skill.getDescription());
    }

    public static Skills toEntity(SkillDto dto) {
        Skills skill = new Skills();
        skill.setId(dto.getId());
        skill.setName(dto.getName());
        skill.setDescription(dto.getDescription());
        return skill;
    }
}

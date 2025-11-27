package com.example.JobPortal.service;

import com.example.JobPortal.entity.SkillMapper;
import com.example.JobPortal.dto.SkillDto;
import com.example.JobPortal.model.Skills;
import com.example.JobPortal.repository.IndustryRepository;
import com.example.JobPortal.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;
    private final IndustryRepository industryRepository;

    public List<SkillDto> getAllSkills() {
        return skillRepository.findAll()
                .stream()
                .map(SkillMapper::toDto)
                .toList();
    }

    public SkillDto getSkillById(Long id) {
        Skills skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found with id " + id));
        return SkillMapper.toDto(skill);
    }

//    public SkillDto createSkill(SkillDto dto) {
//        if (skillRepository.findByName(dto.getName()).isPresent()) {
//            throw new RuntimeException("Skill already exists: " + dto.getName());
//        }
//        Skills skill = skillRepository.save(SkillMapper.toEntity(dto));
//        return SkillMapper.toDto(skill);
//    }

    public SkillDto createSkill(SkillDto dto) {
        if (skillRepository.findByName(dto.getName()).isPresent()) {
            throw new RuntimeException("Skill already exists: " + dto.getName());
        }

        Skills skill = SkillMapper.toEntity(dto);

        // 🆕 Nếu có industryId thì gán luôn industry
        if (dto.getIndustryId() != null) {
            skill.setIndustry(
                    industryRepository.findById(dto.getIndustryId())
                            .orElseThrow(() -> new RuntimeException("Industry not found with id " + dto.getIndustryId()))
            );
        }

        skill = skillRepository.save(skill);
        return SkillMapper.toDto(skill);
    }

    public SkillDto updateSkill(Long id, SkillDto dto) {
        Skills skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found with id " + id));
        skill.setName(dto.getName());
        return SkillMapper.toDto(skillRepository.save(skill));
    }

    public void deleteSkill(Long id) {
        if (!skillRepository.existsById(id)) {
            throw new RuntimeException("Skill not found with id " + id);
        }
        skillRepository.deleteById(id);
    }
}



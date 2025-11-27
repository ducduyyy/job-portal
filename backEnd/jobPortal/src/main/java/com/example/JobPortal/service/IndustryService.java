package com.example.JobPortal.service;

import com.example.JobPortal.dto.IndustryDto;
import com.example.JobPortal.dto.JobDto;
import com.example.JobPortal.model.Industry;
import com.example.JobPortal.model.Jobs;
import com.example.JobPortal.model.Skills;
import com.example.JobPortal.repository.IndustryRepository;
import com.example.JobPortal.repository.JobRepository;
import com.example.JobPortal.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class IndustryService {

    private final IndustryRepository industryRepository;

    private final JobRepository jobRepository;

    private final SkillRepository skillRepository;

    public List<Industry> getAllIndustries() {
        return industryRepository.findAll();
    }

    public Optional<Industry> getIndustryById(Long id) {
        return industryRepository.findById(id);
    }

    public List<IndustryDto> getAllIndustriesWithJobCount() {
        List<Industry> industries = industryRepository.findAll();
        List<Object[]> jobCounts = industryRepository.countJobsByIndustry();

        // Chuyển danh sách jobCount thành Map<industryId, count>
        Map<Long, Long> countMap = new HashMap<>();
        for (Object[] row : jobCounts) {
            Long id = ((Number) row[0]).longValue();
            Long count = ((Number) row[1]).longValue();
            countMap.put(id, count);
        }

        // Chuyển sang DTO
        return industries.stream()
                .map(industry -> {
                    IndustryDto dto = new IndustryDto(industry);
                    dto.setJobCount(countMap.getOrDefault(industry.getId(), 0L));
                    return dto;
                })
                .toList();
    }


//    public List<Skills> getSkillsByIndustry(Long id) {
//        return industryRepository.findById(id)
//                .map(Industry::getSkills)
//                .orElseThrow(() -> new RuntimeException("Industry not found with id " + id));
//    }

    public List<Skills> getSkillsByIndustry(Long industryId) {
        Industry industry = industryRepository.findById(industryId)
                .orElseThrow(() -> new RuntimeException("Industry not found"));
        return industry.getSkills(); // <-- trả về danh sách skill trực tiếp
    }


    public Industry getIndustryByJobId(Long jobId) {
        return jobRepository.findById(jobId)
                .map(Jobs::getIndustry)
                .orElseThrow(() -> new RuntimeException("Job not found with id " + jobId));
    }

    public Industry createIndustry(Industry industry) {
        return industryRepository.save(industry);
    }

    public Industry updateIndustry(Long id, Industry updated) {
        return industryRepository.findById(id).map(ind -> {
            ind.setName(updated.getName());
            ind.setDescription(updated.getDescription());
            return industryRepository.save(ind);
        }).orElseThrow(() -> new RuntimeException("Industry not found with id " + id));
    }

    public void deleteIndustry(Long id) {
        industryRepository.deleteById(id);
    }
}


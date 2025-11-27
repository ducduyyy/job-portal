package com.example.JobPortal.mapper;

import com.example.JobPortal.dto.ApplicationDto;
import com.example.JobPortal.model.Applications;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMapper {

    public ApplicationDto toDto(Applications app) {
        ApplicationDto dto = new ApplicationDto();
        dto.setId(app.getId());

        if (app.getJob() != null) {
            dto.setJobId(app.getJob().getId());
            dto.setJobTitle(app.getJob().getTitle());
            dto.setJobLocation(app.getJob().getLocation());
            if (app.getJob().getIndustry() != null) {
                dto.setIndustryName(app.getJob().getIndustry().getName());
            }
            dto.setJobType(app.getJob().getJobType().toString());
            dto.setJobLevel(app.getJob().getLevel().toString());
            dto.setCompanyName(app.getJob().getPostedBy().getCompanyName());
        }

        if (app.getCandidate() != null) {
            dto.setCandidateId(app.getCandidate().getId());
            dto.setCandidateName(app.getCandidate().getFullName());
        }

        dto.setCvUrl(app.getCvUrl());
        dto.setStatus(app.getStatus());
        dto.setAppliedAt(app.getAppliedAt());

        return dto;
    }
}

package com.example.JobPortal.service;

import com.example.JobPortal.dto.EmployerProfileRequest;
import com.example.JobPortal.dto.EmployerProfileResponse;
import com.example.JobPortal.model.EmployerProfiles;
import com.example.JobPortal.model.User;
import com.example.JobPortal.repository.EmployerProfilesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EmployerProfilesService {

    private final EmployerProfilesRepository repository;

    public EmployerProfiles createOrUpdateProfile(User user, EmployerProfileRequest request) {

        EmployerProfiles profile = repository.findByUser(user).orElse(new EmployerProfiles());
        profile.setUser(user);
        profile.setCompanyName(request.getCompanyName());
        profile.setCompanyAddress(request.getCompanyAddress());
        profile.setCompanySize(request.getCompanySize());
        profile.setContactEmail(request.getContactEmail());
        profile.setCompanyNumber(request.getCompanyNumber());
        profile.setCompanyDescription(request.getCompanyDescription());
        profile.setWebsite(request.getWebsite());
        profile.setFoundedYear(request.getFoundedYear());
        if(request.getCompanyIMG() != null && !request.getCompanyIMG().isEmpty()) {
            profile.setCompanyIMG(request.getCompanyIMG());
        }else if (profile.getId() != null){
            profile.setCompanyIMG(profile.getCompanyIMG());
        }

        if(request.getCompanyLogo() != null && !request.getCompanyLogo().isEmpty()) {
            profile.setCompanyLogo(request.getCompanyLogo());
        }else if (profile.getId() != null){
            profile.setCompanyLogo(profile.getCompanyLogo());
        }

        return repository.save(profile);
    }

    public EmployerProfileResponse toResponse(EmployerProfiles profile) {
        EmployerProfileResponse dto = new EmployerProfileResponse();
        dto.setId(profile.getId());
        dto.setCompanyName(profile.getCompanyName());
        dto.setCompanyAddress(profile.getCompanyAddress());
        dto.setCompanySize(profile.getCompanySize());
        dto.setContactEmail(profile.getContactEmail());
        dto.setCompanyNumber(profile.getCompanyNumber());
        dto.setCompanyDescription(profile.getCompanyDescription());
        dto.setWebsite(profile.getWebsite());
        dto.setFoundedYear(profile.getFoundedYear());
        dto.setCompanyIMG(profile.getCompanyIMG());
        dto.setCompanyLogo(profile.getCompanyLogo());
        return dto;
    }

    public Optional<EmployerProfiles> getByUserId(Long userId) {
        return repository.findByUserId(userId);
    }
}

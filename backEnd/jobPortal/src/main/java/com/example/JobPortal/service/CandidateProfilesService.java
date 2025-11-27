package com.example.JobPortal.service;

import com.example.JobPortal.dto.CandidateProfileRequest;
import com.example.JobPortal.dto.CandidateProfileResponse;
import com.example.JobPortal.dto.LoginResponse;
import com.example.JobPortal.model.CandidateProfiles;
import com.example.JobPortal.model.User;
import com.example.JobPortal.repository.CandidateProfilesRepository;
import com.example.JobPortal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CandidateProfilesService {
    private final CandidateProfilesRepository candidateProfilesRepository;

    public CandidateProfiles createOrUpdateProfile(User user, CandidateProfileRequest request) {
        if (request.getEmail() != null) request.setEmail(request.getEmail());
        // Cập nhật CandidateProfiles
        CandidateProfiles profile = candidateProfilesRepository.findByUser(user)
                .orElse(new CandidateProfiles());
        profile.setUser(user);
        profile.setFullName(request.getFullName());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());
        profile.setAddress(request.getAddress());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setEducation(request.getEducation());
        if (request.getCandidateIMG() != null && !request.getCandidateIMG().isEmpty()) {
            profile.setCandidateIMG(request.getCandidateIMG());
        } else if (profile.getId() != null) {
            // giữ nguyên giá trị cũ trong DB
            profile.setCandidateIMG(profile.getCandidateIMG());
        }

        profile.setCvs(request.getCvs());
        profile.setBio(request.getBio());

        user.setStatus(user.getStatus());

        return candidateProfilesRepository.save(profile);
    }

    public CandidateProfileResponse toResponse(CandidateProfiles profile) {
        CandidateProfileResponse dto = new CandidateProfileResponse();
        dto.setId(profile.getId());
        dto.setFullName(profile.getFullName());
        dto.setEmail(profile.getEmail());
        dto.setPhone(profile.getPhone());
        dto.setAddress(profile.getAddress());
        dto.setExperienceYears(profile.getExperienceYears());
        dto.setEducation(profile.getEducation());
        dto.setCandidateIMG(profile.getCandidateIMG());
        dto.setCvs(profile.getCvs() != null ? profile.getCvs() : List.of());
        dto.setBio(profile.getBio());
        dto.setIsActive(profile.getUser().getStatus().name());
        return dto;
    }

    public Optional<CandidateProfiles> getByUserId(Long userId) {
        return candidateProfilesRepository.findByUserId(userId);
    }

    public CandidateProfiles save(CandidateProfiles profile) {
        return candidateProfilesRepository.save(profile);
    }

    public void addCvToProfile(Long userId, String cvUrl) {
        CandidateProfiles profile = candidateProfilesRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found for user " + userId));

        List<String> cvs = profile.getCvs() != null ? new ArrayList<>(profile.getCvs()) : new ArrayList<>();
        cvs.add(cvUrl);
        profile.setCvs(cvs);

        candidateProfilesRepository.save(profile);
    }


}


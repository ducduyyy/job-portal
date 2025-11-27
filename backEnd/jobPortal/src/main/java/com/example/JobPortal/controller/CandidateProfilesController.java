package com.example.JobPortal.controller;

import com.example.JobPortal.dto.CandidateProfileRequest;
import com.example.JobPortal.dto.CandidateProfileResponse;
import com.example.JobPortal.dto.UserSkillDto;
import com.example.JobPortal.model.*;
import com.example.JobPortal.service.CandidateProfilesService;
import com.example.JobPortal.service.UserSkillService;
import com.example.JobPortal.service.UserService;
import com.example.JobPortal.service.util.FileStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "candidate-controller", description = "Quản lý thông tin ứng viên")
public class CandidateProfilesController {

    private final CandidateProfilesService candidateProfilesService;
    private final UserService userService;
    private final UserSkillService userSkillService;
    private final FileStorageService fileStorageService;
    // Tạo hoặc cập nhật profile
    @PostMapping("/{userId}/profile")
    public ResponseEntity<CandidateProfileResponse> createOrProfile(
            @PathVariable Long userId,
            @RequestBody CandidateProfileRequest request
    ) {
        User user = userService.getById(userId);
        CandidateProfiles profile = candidateProfilesService.createOrUpdateProfile(user, request);

        CandidateProfileResponse response = new CandidateProfileResponse();
        response.setId(profile.getId());
        response.setFullName(profile.getFullName());
        response.setEmail(profile.getEmail());
        response.setPhone(profile.getPhone());
        response.setAddress(profile.getAddress());
        response.setExperienceYears(profile.getExperienceYears());
        response.setEducation(profile.getEducation());
        response.setCandidateIMG(profile.getCandidateIMG());
        response.setCvs(profile.getCvs());
        response.setBio(profile.getBio());
        response.setBirthdate(profile.getBirthdate() != null ? profile.getBirthdate().toLocalDate() : null);
        response.setIsActive("true"); // hoặc set logic tùy nhu cầu

        return ResponseEntity.ok(response);
    }



    // Cập nhật profile với avatar và CV
    @PostMapping("/edit/{userId}/profile")
    public ResponseEntity<CandidateProfiles> updateProfile(
            @PathVariable Long userId,
            @RequestPart("profile") CandidateProfileRequest request,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            @RequestPart(value = "cvFiles", required = false) MultipartFile[] cvFiles,
            @RequestParam(value = "existingCvUrls", required = false) String[] existingCvUrls
    ) {
        User user = userService.getById(userId);

        // Lưu avatar
        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = fileStorageService.saveFile(avatar,userId, "avatars");
            request.setCandidateIMG(avatarUrl);
        }

        // Lưu CV
        List<String> finalCvUrls = new ArrayList<>();
        if (existingCvUrls != null)
            finalCvUrls.addAll(Arrays.asList(existingCvUrls));
        if (cvFiles != null)
        {
            for (MultipartFile file : cvFiles)
            {
                if (!file.isEmpty())
                {
                    String cvUrl = fileStorageService.saveFile(file,userId, "cvs");
                    finalCvUrls.add(cvUrl);
                }
            }
        }
        request.setCvs(finalCvUrls);

        CandidateProfiles profile = candidateProfilesService.createOrUpdateProfile(user, request);
        return ResponseEntity.ok(profile);
    }

    // Lấy profile theo userId
    @GetMapping("/{userId}/profile")
    public ResponseEntity<CandidateProfileResponse> getProfile(@PathVariable Long userId) {
        return candidateProfilesService.getByUserId(userId)
                .map(candidateProfilesService::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Thêm skill cho user
    @PostMapping("/{userId}/skills")
    public ResponseEntity<UserSkillDto> addUserSkill(
            @PathVariable Long userId,
            @RequestParam Long skillId) {

        User user = userService.getById(userId);
        Skills skill = new Skills();
        skill.setId(skillId);

        UserSkillId id = new UserSkillId(userId, skillId);
        UserSkill userSkill = new UserSkill(id, user, skill);

        return ResponseEntity.ok(userSkillService.addSkill(userSkill));
    }

    // Lấy danh sách skills của user
    @GetMapping("/{userId}/skills")
    public ResponseEntity<List<UserSkillDto>> getUserSkills(@PathVariable Long userId) {
        User user = userService.getById(userId);
        return ResponseEntity.ok(userSkillService.getSkillsByUser(user));
    }

    // Xóa skill
    @DeleteMapping("/{userId}/skills/{skillId}")
    public ResponseEntity<Void> deleteUserSkill(
            @PathVariable Long userId,
            @PathVariable Long skillId) {

        userSkillService.deleteSkill(new UserSkillId(userId, skillId));
        return ResponseEntity.noContent().build();
    }

    // Lấy avatar
    @GetMapping("/avatar/{filename}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String filename) throws IOException {
        Path path = fileStorageService.getFilePath("avatars", filename);
        Resource resource = new FileSystemResource(path.toFile());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    // Lấy CV
    @GetMapping("/cv/{filename}")
    public ResponseEntity<Resource> getCv(@PathVariable String filename) throws IOException {
        Path path = fileStorageService.getFilePath("cvs", filename);
        Resource resource = new FileSystemResource(path.toFile());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    // Lấy danh sách CV của user
    @GetMapping("/{userId}/cvs")
    public HttpEntity<List<?>> getCandidateCvs(@PathVariable Long userId) {
        return candidateProfilesService.getByUserId(userId)
                .map(profile -> ResponseEntity.ok(profile.getCvs() != null ? profile.getCvs() : List.of()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}/cv/view/{filename}")
    public ResponseEntity<Resource> viewCv(@PathVariable Long userId, @PathVariable String filename) throws IOException {
        Path path = fileStorageService.getFilePath(userId + "/cvs", filename);
        Resource resource = new FileSystemResource(path.toFile());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }

    @PostMapping("/{userId}/upload-cv")
    public ResponseEntity<String> uploadCvOnly(
            @PathVariable Long userId,
            @RequestParam("cvFile") MultipartFile cvFile
    ) {
        try {
            if (cvFile == null || cvFile.isEmpty()) {
                return ResponseEntity.badRequest().body("No file uploaded");
            }

            // 🔹 Lưu file vào thư mục /uploads/{userId}/cvs/
            String cvUrl = fileStorageService.saveFile(cvFile, userId, "cvs");

            // 🔹 Gán vào profile hiện tại của ứng viên
            candidateProfilesService.addCvToProfile(userId, cvUrl);

            return ResponseEntity.ok(cvUrl); // trả lại URL cho FE
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error uploading CV: " + e.getMessage());
        }
    }

}

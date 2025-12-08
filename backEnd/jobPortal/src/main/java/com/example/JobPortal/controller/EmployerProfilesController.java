package com.example.JobPortal.controller;

import com.example.JobPortal.dto.*;
import com.example.JobPortal.model.*;
import com.example.JobPortal.service.EmployerProfilesService;
import com.example.JobPortal.service.UserService;
import com.example.JobPortal.service.util.FileStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/employers")
@RequiredArgsConstructor
@Tag(name = "employer-controller", description = "Quản lý thông tin nhà tuyển dụng")
public class EmployerProfilesController {

    private final EmployerProfilesService employerProfilesService;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    @PostMapping("/{userId}/profile")
    public ResponseEntity<EmployerProfileResponse> create(
            @PathVariable Long userId,
            @RequestBody EmployerProfileRequest request
    ) {
        User user = userService.getById(userId);
        EmployerProfiles profile = employerProfilesService.createOrUpdateProfile(user, request);

        // map sang DTO và trả về
        EmployerProfileResponse dto = employerProfilesService.toResponse(profile);
        return ResponseEntity.ok(dto);
    }
    @GetMapping("/{userId}/profile")
    public ResponseEntity<EmployerProfileResponse> getProfile(@PathVariable Long userId) {
        return employerProfilesService.getByUserId(userId)
                .map(employerProfilesService::toResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/edit/{userId}/profile")
    public ResponseEntity<EmployerProfileResponse> updateProfile(
            @PathVariable Long userId,
            @RequestPart("profile") EmployerProfileRequest request,
            @RequestPart(value = "companyPic", required = false) MultipartFile[] companyPics,
            @RequestPart(value = "logo", required = false) MultipartFile logo
    ) {
        User user = userService.getById(userId);

        // Lưu avatar
        if (companyPics != null && companyPics.length > 0) {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile pic : companyPics) {
                if (!pic.isEmpty()) {
                    String url = fileStorageService.saveFile(pic, userId, "companyPic");
                    imageUrls.add(url);
                }
            }
            request.setCompanyIMG(String.join(",", imageUrls)); // hoặc dùng List<String> nếu bạn đổi kiểu trong Entity
        }


        if (logo != null && !logo.isEmpty()) {
            String logoUrl = fileStorageService.saveFile(logo,userId, "logo");
            request.setCompanyLogo(logoUrl);
        }


        EmployerProfiles profile = employerProfilesService.createOrUpdateProfile(user, request);

        EmployerProfileResponse dto = employerProfilesService.toResponse(profile);
        return ResponseEntity.ok(dto);
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

}

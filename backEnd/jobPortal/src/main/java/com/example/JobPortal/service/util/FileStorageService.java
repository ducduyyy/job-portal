package com.example.JobPortal.service.util;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileStorageService {
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    public String saveFile(MultipartFile file, Long userId, String folder) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR + userId + "/" + folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            file.transferTo(filePath.toFile());

            // ✅ Lưu URL dạng /uploads/{userId}/{folder}/{fileName}
            return "/uploads/" + userId + "/" + folder + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu file: " + e.getMessage());
        }
    }


    public Path getFilePath(String folder, String filename) {
        return Paths.get(UPLOAD_DIR + folder + "/" + filename);
    }



    // ✅ Phương thức MỚI: Lưu CV theo quy tắc applications/pdf/{applicationId}
    public String saveApplicationCv(MultipartFile file, Long applicationId) {
        final String CV_FOLDER = "applications/pdf";
        try {
            // Đường dẫn mới: UPLOAD_DIR / applications/pdf / {applicationId}
            Path uploadPath = Paths.get(UPLOAD_DIR + CV_FOLDER + "/" + applicationId);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            file.transferTo(filePath.toFile());

            // ✅ Lưu URL dạng /uploads/applications/pdf/{applicationId}/{fileName}
            return "/uploads/" + CV_FOLDER + "/" + applicationId + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu CV ứng tuyển: " + e.getMessage());
        }
    }

    // ✅ Phương thức MỚI: Tải file từ URL đã lưu trong DB
    public Resource loadFileAsResource(String fileUrl) {
        // fileUrl có định dạng /uploads/...
        // Cần loại bỏ "/uploads/" để có đường dẫn tương đối từ UPLOAD_DIR
        if (fileUrl == null || !fileUrl.startsWith("/uploads/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file URL format.");
        }

        String relativePath = fileUrl.substring("/uploads/".length());
        Path filePath = Paths.get(UPLOAD_DIR, relativePath);

        if (!Files.exists(filePath) || !Files.isReadable(filePath)) {
            // Log lỗi: File not found
            return null;
        }

        return new FileSystemResource(filePath.toFile());
    }

    // ✅ Lưu ảnh Job theo employerId
    public String saveJobImage(MultipartFile file, Long employerId) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR + "job-img/" + employerId + "/img");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            file.transferTo(filePath.toFile());

            // Trả về URL để lưu vào DB
            return "/uploads/job-img/" + employerId + "/img/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu ảnh công việc: " + e.getMessage());
        }
    }


}

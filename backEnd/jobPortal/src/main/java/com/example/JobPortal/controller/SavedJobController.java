package com.example.JobPortal.controller;

import com.example.JobPortal.dto.JobDto;
import com.example.JobPortal.model.SavedJob;
import com.example.JobPortal.service.itf.SavedJobService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates/saved-jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "saved-controller", description = "Quản lý thông tin các công việc đã được lưu bởi ứng viên")
public class SavedJobController {

    private final SavedJobService savedJobService;

    // ✅ Lưu job
    @PostMapping
    public ResponseEntity<SavedJob> saveJob(
            @RequestParam Long candidateId,
            @RequestParam Long jobId) {
        return ResponseEntity.ok(savedJobService.saveJob(candidateId, jobId));
    }

    // ✅ Xóa job khỏi danh sách đã lưu
    @DeleteMapping("/{candidateId}/{jobId}")
    public ResponseEntity<Void> removeJob(
            @PathVariable Long candidateId,
            @PathVariable Long jobId) {
        savedJobService.removeSavedJob(candidateId, jobId);
        return ResponseEntity.noContent().build();
    }

    // ✅ Lấy danh sách job đã lưu của ứng viên
    @GetMapping("/{candidateId}")
    public ResponseEntity<List<JobDto>> getSavedJobs(@PathVariable Long candidateId) {
        return ResponseEntity.ok(savedJobService.getSavedJobsByCandidate(candidateId));
    }
}

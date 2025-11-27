package com.example.JobPortal.controller;

import com.example.JobPortal.dto.IndustryDto;
import com.example.JobPortal.model.Industry;
import com.example.JobPortal.model.Skills;
import com.example.JobPortal.service.IndustryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/industries")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "industry-controller", description = "Quản lý thông tin của các ngành nghề")
public class IndustryController {

    private final IndustryService industryService;

    @GetMapping
    public ResponseEntity<List<IndustryDto>> getAllIndustries() {
        List<IndustryDto> result = industryService.getAllIndustriesWithJobCount();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Industry> getIndustryById(@PathVariable Long id) {
        return industryService.getIndustryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/skills")
    public ResponseEntity<List<Skills>> getSkillsByIndustry(@PathVariable Long id) {
        return ResponseEntity.ok(industryService.getSkillsByIndustry(id));
    }

    @PostMapping
    public ResponseEntity<Industry> createIndustry(@RequestBody Industry industry) {
        return ResponseEntity.ok(industryService.createIndustry(industry));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Industry> updateIndustry(@PathVariable Long id, @RequestBody Industry industry) {
        return ResponseEntity.ok(industryService.updateIndustry(id, industry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIndustry(@PathVariable Long id) {
        industryService.deleteIndustry(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-job/{jobId}")
    public ResponseEntity<?> getIndustryByJobId(@PathVariable Long jobId) {
        return ResponseEntity.ok(industryService.getIndustryByJobId(jobId));
    }


}


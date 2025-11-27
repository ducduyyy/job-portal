package com.example.JobPortal.dto;

import com.example.JobPortal.enums.ApplicationStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter@Setter
public class ApplicationDto {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String jobLocation;
    private String industryName;
    private String jobType;
    private String jobLevel;
    private String CompanyName;
    private Long candidateId;
    private String candidateName;
    private String cvUrl;
    private ApplicationStatus status;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime appliedAt;
}

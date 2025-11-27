package com.example.JobPortal.dto;

import com.example.JobPortal.enums.ExperienceLevels;
import com.example.JobPortal.enums.JobStatus;
import com.example.JobPortal.enums.JobType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobDto {
    private Long id;

    private String title;
    private String description;
    private String location;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    private String jobIMG;

    private JobType jobType;
    private ExperienceLevels level;
    private String status;
    private Boolean featured;

    private Integer viewsCount;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Industry info
    private Long industryId;
    private String industryName;

    // PostedBy info (thay vì User object)
    private Long postedById;
    private String postedByName;

    private Long totalApplications; // tổng số ứng tuyển cho job
    private Long totalViews;        // tổng view (nếu bạn có bảng tracking)

    private List<String> skills;
    private String skillDescription;
    private Integer requiredExperience;
    private List<String> requirements = new ArrayList<>();

    private Integer jobApplicants;
    private String CompanyEmail;
    private String CompanyPhone;

    private Boolean visible;
    private List<String> benefit = new ArrayList<>();


}

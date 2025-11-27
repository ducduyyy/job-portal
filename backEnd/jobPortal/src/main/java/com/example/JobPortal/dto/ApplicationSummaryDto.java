package com.example.JobPortal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationSummaryDto {
    private String applicantName;
    private String jobTitle;
    private String appliedAt;
}

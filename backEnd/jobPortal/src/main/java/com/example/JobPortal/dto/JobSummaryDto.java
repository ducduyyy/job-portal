package com.example.JobPortal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JobSummaryDto {
    private Long id;
    private String title;
    private String location;
    private String status;
    private String createdAt;
}

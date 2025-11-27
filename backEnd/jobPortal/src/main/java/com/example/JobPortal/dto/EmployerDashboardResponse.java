package com.example.JobPortal.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@Getter@Setter
@AllArgsConstructor@NoArgsConstructor
public class EmployerDashboardResponse {
    private int totalJobs;
    private int totalApplications;
    private int totalViews;
    private int totalHired;

    private double jobChange;          // % thay đổi job
    private double applicationChange;  // % thay đổi ứng tuyển
    private double viewChange;         // % thay đổi lượt xem
    private double hiredChange;        // % thay đổi ứng viên tuyển

    private List<JobDto> recentJobs;
    private List<Map<String, Object>> recentApplications;

    private List<Map<String, Object>> viewsData;
    private List<Map<String, Object>> applicationData;

    private Long reportedJobsCount;

}


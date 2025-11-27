// src/main/java/com/example/JobPortal/dto/AdminDashboardStatsDto.java
package com.example.JobPortal.dto;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AdminDashboardStatsDto {
    private long totalUsers;
    private long activeJobs;
    private long totalApplications;
    private long pendingReports;
    private List<IndustryJobCountDto> industryData;
    private List<MonthlyDataDto> growthData;

    private List<NotificationDto> recentActivities;
}
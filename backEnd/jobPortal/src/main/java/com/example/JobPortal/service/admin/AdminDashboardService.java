package com.example.JobPortal.service.admin;
import com.example.JobPortal.dto.AdminDashboardStatsDto;

public interface AdminDashboardService {
    AdminDashboardStatsDto getDashboardStats();
    AdminDashboardStatsDto initializeSampleData();
}
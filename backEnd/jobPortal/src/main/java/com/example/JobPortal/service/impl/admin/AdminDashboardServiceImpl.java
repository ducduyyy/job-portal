package com.example.JobPortal.service.impl.admin;

import com.example.JobPortal.dto.AdminDashboardStatsDto;
import com.example.JobPortal.dto.IndustryJobCountDto;
import com.example.JobPortal.dto.MonthlyDataDto;
import com.example.JobPortal.dto.NotificationDto;
import com.example.JobPortal.enums.*; // Import enums
import com.example.JobPortal.model.*; // Import models
import com.example.JobPortal.repository.*; // Import repos
import com.example.JobPortal.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final ReportRepository reportRepository;
    private final IndustryRepository industryRepository;
    private final NotificationRepository notificationRepository;


    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        long totalUsers = userRepository.count();
        if (totalUsers == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Stats not initialized.");
        }

        long activeJobs = jobRepository.countByStatus(JobStatus.OPEN); // Giả sử 'OPEN' là active
        long totalApplications = applicationRepository.count();
        long pendingReports = reportRepository.countByStatus(ReportStatus.PENDING);

        List<IndustryJobCountDto> industryData = industryRepository.findIndustryJobCountsForAdmin();

        // ✅ Lấy dữ liệu tăng trưởng user và job
        List<Object[]> userGrowth = userRepository.findUserGrowthLast6MonthsNative();
        List<Object[]> jobGrowth = jobRepository.findJobGrowthLast6Months();

        Map<String, Long> userGrowthMap = userGrowth.stream()
                .collect(Collectors.toMap(o -> (String) o[0], o -> ((Number) o[1]).longValue()));
        Map<String, Long> jobGrowthMap = jobGrowth.stream()
                .collect(Collectors.toMap(o -> (String) o[0], o -> ((Number) o[1]).longValue()));

        // ✅ Tạo danh sách 6 tháng gần nhất
        List<String> last6Months = Stream.iterate(LocalDate.now().minusMonths(5), d -> d.plusMonths(1))
                .limit(6)
                .map(d -> d.format(DateTimeFormatter.ofPattern("yyyy-MM")))
                .toList();

        // ✅ Merge dữ liệu users và jobs
        List<MonthlyDataDto> growthData = last6Months.stream()
                .map(month -> new MonthlyDataDto(
                        month,
                        userGrowthMap.getOrDefault(month, 0L),
                        jobGrowthMap.getOrDefault(month, 0L)
                ))
                .collect(Collectors.toList());

        // 🆕 Recent Activities (Notifications)
        List<NotificationDto> recentActivities = notificationRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(n -> NotificationDto.builder()
                        .id(n.getId())
                        .title(generateNotificationTitle(n.getType()))
                        .message(n.getMessage())
                        .type(n.getType().name())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .toList();



        return AdminDashboardStatsDto.builder()
                .totalUsers(totalUsers)
                .activeJobs(activeJobs)
                .totalApplications(totalApplications)
                .pendingReports(pendingReports)
                .industryData(industryData)
                .growthData(growthData)
                .recentActivities(recentActivities)
                .build();
    }

    private String generateNotificationTitle(NotificationType type) {
        return switch (type) {
            case JOB_CREATED -> "New Job Posted";
            case JOB_UPDATED -> "Job Updated";
            case JOB_DELETED -> "Job Deleted";
            case JOB_HIDDEN -> "Job Hidden";
            case JOB_REPORTED -> "Job Reported";
            case JOB_APPLIED -> "New Application Submitted";
            case APPLICATION_ACCEPTED -> "Application Accepted";
            case APPLICATION_REJECTED -> "Application Rejected";
            case CANDIDATE_UPLOAD_CV -> "Candidate Uploaded CV";
            case CANDIDATE_UPLOAD_AVATAR -> "Candidate Updated Avatar";
            case USER_REGISTERED -> "New User Registered";
            case USER_DELETED -> "User Account Deleted";
            case REPORT_RECEIVED -> "New Report Received";
            default -> "System Notification";
        };
    }



    private List<MonthlyDataDto> mergeGrowthData(Map<String, Long> userMap, Map<String, Long> jobMap) {
        List<String> last6Months = Stream.iterate(LocalDate.now().minusMonths(5), d -> d.plusMonths(1))
                .limit(6).map(d -> d.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"))).toList();
        return last6Months.stream()
                .map(month -> new MonthlyDataDto(month, userMap.getOrDefault(month, 0L), jobMap.getOrDefault(month, 0L)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AdminDashboardStatsDto initializeSampleData() {
        if (userRepository.count() > 0) return getDashboardStats();
        return getDashboardStats();
    }
}
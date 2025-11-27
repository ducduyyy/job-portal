package com.example.JobPortal.service;

import com.example.JobPortal.dto.EmployerDashboardResponse;
import com.example.JobPortal.dto.JobDto;
import com.example.JobPortal.enums.ApplicationStatus;
import com.example.JobPortal.enums.ExperienceLevels;
import com.example.JobPortal.enums.JobType;
import com.example.JobPortal.model.Applications;
import com.example.JobPortal.model.EmployerProfiles;
import com.example.JobPortal.model.Jobs;
import com.example.JobPortal.repository.ApplicationRepository;
import com.example.JobPortal.repository.EmployerProfilesRepository;
import com.example.JobPortal.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployerDashboardService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final EmployerProfilesRepository employerProfilesRepository;

    // ✅ 1️⃣ Dashboard tổng hợp
    public EmployerDashboardResponse getDashboardData(Long userId) {
        EmployerProfiles employer = employerProfilesRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employer profile not found for user " + userId));

        Long employerId = employer.getId();

        EmployerDashboardResponse res = new EmployerDashboardResponse();

        // 📊 Tổng số liệu
        res.setTotalJobs(getTotalJobs(employerId));
        res.setTotalViews(getTotalViews(employerId));
        res.setTotalApplications(getTotalApplications(employerId));
        res.setTotalHired(getTotalHired(employerId));

        // ✅ Thêm phần đếm job bị report (visible = true)
        res.setReportedJobsCount(jobRepository.countByPostedBy_IdAndVisibleTrue(employerId));

        // 📈 Tính % thay đổi so với tháng trước
        res.setJobChange(calculateJobGrowth(employerId));
        res.setApplicationChange(calculateApplicationGrowth(employerId));
        res.setViewChange(calculateViewGrowth(employerId));
        res.setHiredChange(calculateHiredGrowth(employerId));

        // 🔹 Các danh sách chi tiết
        res.setRecentJobs(getRecentJobs(employerId));
        res.setRecentApplications(getRecentApplications(employerId));
        res.setViewsData(getViewsData(employerId));
        res.setApplicationData(getApplicationsData(employerId));
        return res;
    }


    // ✅ 2️⃣ Tổng số job
    public int getTotalJobs(Long employerId) {
        return jobRepository.findByPostedBy_Id(employerId).size();
    }

    // ✅ 3️⃣ Tổng số lượt xem
    public int getTotalViews(Long employerId) {
        return jobRepository.findByPostedBy_Id(employerId).stream()
                .mapToInt(j -> Optional.ofNullable(j.getViewsCount()).orElse(0))
                .sum();
    }

    // ✅ 4️⃣ Tổng số ứng tuyển
    public int getTotalApplications(Long employerId) {
        return applicationRepository.countByEmployerId(employerId);
    }

    public int getTotalHired(Long employerId) {
        return applicationRepository.countByEmployerIdAndStatus(employerId, ApplicationStatus.ACCEPTED);
    }


    // ✅ 5️⃣ Job gần đây
    public List<JobDto> getRecentJobs(Long employerId) {
        return jobRepository.findByPostedBy_Id(employerId).stream()
                .sorted(Comparator.comparing(Jobs::getCreatedAt).reversed())
                .limit(5)
                .map(this::toJobDto)
                .collect(Collectors.toList());
    }

    // ✅ 6️⃣ Ứng tuyển gần đây
    public List<Map<String, Object>> getRecentApplications(Long employerId) {
        return applicationRepository.findRecentApplicationsByEmployerId(employerId).stream()
                .limit(5)
                .map(a -> Map.<String, Object>of(
                        "applicationId", a.getId(),
                        "jobTitle", a.getJob().getTitle(),
                        "applicantName", a.getCandidate().getFullName(),
                        "appliedAt", a.getAppliedAt(),
                        "status", a.getStatus().name(),
                        "candidateEmail", a.getCandidate().getEmail(),
                        "candidatePhone", a.getCandidate().getPhone()
                ))
                .collect(Collectors.toList());
    }

    // ✅ 7️⃣ Lượt xem theo tháng
    public List<Map<String, Object>> getViewsData(Long employerId) {
        List<Jobs> jobs = jobRepository.findByPostedBy_Id(employerId);

        // Tạo map 12 tháng với giá trị mặc định = 0
        Map<String, Integer> monthData = new LinkedHashMap<>();
        for (Month m : Month.values()) {
            monthData.put(m.getDisplayName(TextStyle.SHORT, Locale.ENGLISH), 0);
        }

        for (Jobs job : jobs) {
            // Nếu job không có createdAt, fallback về tháng hiện tại
            LocalDateTime createdAt = job.getCreatedAt() != null
                    ? job.getCreatedAt()
                    : (job.getUpdatedAt() != null ? job.getUpdatedAt() : LocalDateTime.now());

            String month = createdAt.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            int views = Optional.ofNullable(job.getViewsCount()).orElse(0);

            // Cộng dồn lượt xem theo tháng
            monthData.put(month, monthData.getOrDefault(month, 0) + views);
        }

        // Trả về danh sách để chart render
        return monthData.entrySet().stream()
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("month", e.getKey());
                    map.put("views", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());

    }

    // ✅ 8️⃣ Ứng tuyển theo tháng
    public List<Map<String, Object>> getApplicationsData(Long employerId) {
        List<Object[]> data = applicationRepository.getMonthlyApplicationStats(employerId);
        Map<Integer, Long> map = new HashMap<>();

        for (Object[] row : data) {
            map.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            String month = Month.of(i).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            result.add(Map.of(
                    "month", month,
                    "applications", map.getOrDefault(i, 0L)
            ));
        }
        return result;
    }

    // ✅ Helper
    private JobDto toJobDto(Jobs job) {
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setLocation(job.getLocation());
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setJobIMG(job.getJobIMG());
        dto.setJobType(job.getJobType() != null ? JobType.valueOf(job.getJobType().name()) : null);
        dto.setLevel(job.getLevel() != null ? ExperienceLevels.valueOf(job.getLevel().name()) : null);
        dto.setStatus(job.getStatus() != null ? job.getStatus().name() : "OPEN");
        dto.setFeatured(job.getFeatured());
        dto.setViewsCount(job.getViewsCount());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());

        // 🏷 Industry
        if (job.getIndustry() != null) {
            dto.setIndustryId(job.getIndustry().getId());
            dto.setIndustryName(job.getIndustry().getName());
        }

        // 👔 Employer
        if (job.getPostedBy() != null) {
            dto.setPostedById(job.getPostedBy().getId());
            dto.setPostedByName(job.getPostedBy().getCompanyName());
        }

        return dto;
    }


    // 🔹 Lấy toàn bộ ứng tuyển cho employer
    public Page<Map<String, Object>> getAllApplications(Long employerId, String status, Long jobId, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "appliedAt"));

        Page<Applications> applicationsPage;

        // ✅ Nếu có jobId + status
        if (jobId != null && status != null) {
            applicationsPage = applicationRepository.findByJob_PostedBy_IdAndJob_IdAndStatus(
                    employerId, jobId, ApplicationStatus.valueOf(status.toUpperCase()), pageable);

            // ✅ Nếu chỉ có jobId
        } else if (jobId != null) {
            applicationsPage = applicationRepository.findByJob_PostedBy_IdAndJob_Id(
                    employerId, jobId, pageable);

            // ✅ Nếu chỉ có status
        } else if (status != null) {
            applicationsPage = applicationRepository.findByJob_PostedBy_IdAndStatus(
                    employerId, ApplicationStatus.valueOf(status.toUpperCase()), pageable);

            // ✅ Mặc định lấy tất cả
        } else {
            applicationsPage = applicationRepository.findByJob_PostedBy_Id(employerId, pageable);
        }

        // 🔁 Map dữ liệu sang JSON-friendly structure
        return applicationsPage.map(app -> {
            Map<String, Object> map = new HashMap<>();
            map.put("applicationId", app.getId());
            map.put("status", app.getStatus());
            map.put("appliedAt", app.getAppliedAt());
            map.put("jobId", app.getJob().getId());
            map.put("jobTitle", app.getJob().getTitle());
            map.put("candidateName", app.getCandidate().getFullName());
            map.put("candidateEmail", app.getCandidate().getEmail());
            return map;
        });
    }

    public Long getEmployerIdFromUser(Long userId) {
        EmployerProfiles profile = employerProfilesRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Employer not found for userId: " + userId));
        return profile.getId();
    }

//    public Map<String, Object> updateApplicationStatus(Long applicationId, ApplicationStatus newStatus) {
//        Applications application = applicationRepository.findById(applicationId)
//                .orElseThrow(() -> new RuntimeException("Application not found"));
//
//        application.setStatus(newStatus);
//        applicationRepository.save(application);
//
//        Map<String, Object> response = new HashMap<>();
//        response.put("id", application.getId());
//        response.put("status", application.getStatus());
//        return response;
//    }

    public Map<String, Object> updateApplicationStatus(Long applicationId, ApplicationStatus newStatus) {
        Applications application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        ApplicationStatus currentStatus = application.getStatus();

        // ✅ Kiểm tra nếu trạng thái không hợp lệ
        if (!isStatusChangeAllowed(currentStatus, newStatus)) {
            throw new IllegalStateException(
                    String.format("Không thể chuyển trạng thái từ %s sang %s.", currentStatus, newStatus)
            );
        }

        // ✅ Cập nhật trạng thái
        application.setStatus(newStatus);
        application.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(application);

        // ✅ Chuẩn bị phản hồi trả về Frontend
        Map<String, Object> response = new HashMap<>();
        response.put("applicationId", application.getId());
        response.put("status", application.getStatus().name());
        response.put("candidateName", application.getCandidate().getFullName());
        response.put("jobTitle", application.getJob().getTitle());
        response.put("updatedAt", application.getUpdatedAt());
        return response;
    }

    /**
     * ✅ Quy tắc hợp lệ cho thay đổi trạng thái
     */
    private boolean isStatusChangeAllowed(ApplicationStatus current, ApplicationStatus target) {
        switch (current) {
            case PENDING:
                // Có thể chuyển từ PENDING → REVIEWED / ACCEPTED / REJECTED
                return target == ApplicationStatus.REVIEWED
                        || target == ApplicationStatus.ACCEPTED
                        || target == ApplicationStatus.REJECTED;

            case REVIEWED:
                // Có thể chuyển từ REVIEWED → ACCEPTED / REJECTED
                return target == ApplicationStatus.ACCEPTED
                        || target == ApplicationStatus.REJECTED;

            case ACCEPTED:
            case REJECTED:
                // Không thể thay đổi nếu đã kết thúc quy trình
                return false;

            default:
                return false;
        }
    }


    private double calculateJobGrowth(Long employerId) {
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);

        long currentCount = jobRepository.countByPostedBy_IdAndCreatedAtBetween(
                employerId,
                currentMonth.atDay(1).atStartOfDay(),
                currentMonth.atEndOfMonth().atTime(23, 59, 59)
        );

        long lastCount = jobRepository.countByPostedBy_IdAndCreatedAtBetween(
                employerId,
                lastMonth.atDay(1).atStartOfDay(),
                lastMonth.atEndOfMonth().atTime(23, 59, 59)
        );

        return calculatePercentChange(lastCount, currentCount);
    }

    private double calculateApplicationGrowth(Long employerId) {
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);

        long currentCount = applicationRepository.countByEmployerIdAndAppliedAtBetween(
                employerId,
                currentMonth.atDay(1).atStartOfDay(),
                currentMonth.atEndOfMonth().atTime(23, 59, 59)
        );

        long lastCount = applicationRepository.countByEmployerIdAndAppliedAtBetween(
                employerId,
                lastMonth.atDay(1).atStartOfDay(),
                lastMonth.atEndOfMonth().atTime(23, 59, 59)
        );

        return calculatePercentChange(lastCount, currentCount);
    }

    private double calculateViewGrowth(Long employerId) {
        List<Jobs> jobs = jobRepository.findByPostedBy_Id(employerId);
        // Giả định: ViewsCount tăng mỗi tháng (ở đây không có log lượt xem theo ngày)
        // => tạm coi viewChange = (current total - previous total) / previous total
        int totalViews = jobs.stream().mapToInt(j -> Optional.ofNullable(j.getViewsCount()).orElse(0)).sum();
        int previousViews = (int) (totalViews * 0.88); // tạm giả định tháng trước ít hơn 12%
        return calculatePercentChange(previousViews, totalViews);
    }

    private double calculateHiredGrowth(Long employerId) {
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = currentMonth.minusMonths(1);

        long currentCount = applicationRepository.countByEmployerIdAndStatusAndAppliedAtBetween(
                employerId,
                ApplicationStatus.ACCEPTED,
                currentMonth.atDay(1).atStartOfDay(),
                currentMonth.atEndOfMonth().atTime(23, 59, 59)
        );

        long lastCount = applicationRepository.countByEmployerIdAndStatusAndAppliedAtBetween(
                employerId,
                ApplicationStatus.ACCEPTED,
                lastMonth.atDay(1).atStartOfDay(),
                lastMonth.atEndOfMonth().atTime(23, 59, 59)
        );

        return calculatePercentChange(lastCount, currentCount);
    }

    // ✅ Hàm tính % tăng trưởng
    private double calculatePercentChange(long previous, long current) {
        if (previous == 0 && current > 0) return 100.0;
        if (previous == 0) return 0.0;
        return ((double) (current - previous) / previous) * 100.0;
    }



}

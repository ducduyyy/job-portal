package com.example.JobPortal.service.impl;

import com.example.JobPortal.dto.JobDto;
import com.example.JobPortal.dto.JobSearchCriteria;
import com.example.JobPortal.enums.JobStatus;
import com.example.JobPortal.enums.JobType;
import com.example.JobPortal.enums.NotificationType;
import com.example.JobPortal.model.*;
import com.example.JobPortal.repository.*;
import com.example.JobPortal.service.itf.JobService;

import com.example.JobPortal.service.util.NotificationBuilder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import com.example.JobPortal.dto.JobSearchCriteria;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final IndustryRepository industryRepository;
    private final EmployerProfilesRepository employerProfilesRepository;
    private final SkillRepository skillRepository;
    private final JobSkillRepository jobSkillRepository;
    private final UserRepository userRepository;
    private final NotificationBuilder  notificationBuilder;
    private final ReportRepository reportRepository;

    @Override
    public List<JobDto> getAllJobs() {
        return jobRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .toList();
    }

//    @Override
//    public JobDto createOrUpdateJob(JobDto jobDto) {
//        Jobs job = mapToEntity(jobDto);
//        Jobs saved = jobRepository.save(job);
//        return mapToDto(saved);
//    }

//    @Transactional(readOnly = true)
    @Override
    public Optional<JobDto> getJobById(Long id) {
        return jobRepository.findById(id)
                .map(this::mapToDto);
    }

    @Override
    public List<JobDto> getJobsByEmployer(Long employerId) {
        return jobRepository.findByPostedBy_Id(employerId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteJob(Long id) {
        Jobs job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Long employerUserId = job.getPostedBy().getUser().getId();
        String title = job.getTitle();

        jobRepository.deleteById(id);

        // ✅ Gửi thông báo khi job bị xóa
        notificationBuilder.notifyEmployer(
                employerUserId,
                NotificationType.JOB_DELETED,
                "Your job '" + title + "' has been deleted."
        );

        notificationBuilder.notifyAllAdmins(
                NotificationType.JOB_DELETED,
                "Employer deleted job: '" + title + "'."
        );
    }

    @Override
    public Jobs getJobEntityById(Long jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    }


    // ✅ Cập nhật trạng thái featured
    @Override
    public JobDto updateFeaturedStatus(Long id, boolean featured) {
        Jobs job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));

        job.setFeatured(featured);
        job.setUpdatedAt(LocalDateTime.now());

        // ✅ Gửi thông báo khi job được đánh dấu nổi bật
        notificationBuilder.notifyEmployer(
                job.getPostedBy().getUser().getId(),
                NotificationType.JOB_UPDATED,
                "Your job '" + job.getTitle() + "' has been marked as featured."
        );

        jobRepository.save(job);
        return mapToDto(job);
    }

    // ✅ Lấy danh sách job nổi bật
    @Override
    public List<JobDto> getFeaturedJobs() {
        return jobRepository.findByFeaturedTrue()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void incrementViewCount(Long jobId) {
        Jobs job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setViewsCount(job.getViewsCount() + 1);
        jobRepository.save(job);
    }


    // -------- Mapping --------
    private JobDto mapToDto(Jobs job) {
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setLocation(job.getLocation());
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setJobIMG(job.getJobIMG());
        dto.setJobType(job.getJobType());
        dto.setLevel(job.getLevel());
        dto.setVisible(job.getVisible());
        dto.setStatus(job.getStatus().name());
        System.out.println("job status: " + job.getStatus().name());
        dto.setViewsCount(job.getViewsCount());
        dto.setCreatedAt(job.getCreatedAt());
        dto.setUpdatedAt(job.getUpdatedAt());
        dto.setFeatured(job.getFeatured());
        dto.setRequiredExperience(job.getRequiredExperience());
        dto.setRequirements(job.getRequirements());
        dto.setBenefit(job.getBenefit());

        if (job.getIndustry() != null) {
            dto.setIndustryId(job.getIndustry().getId());
            dto.setIndustryName(job.getIndustry().getName());
        }

        if (job.getPostedBy() != null) {
            dto.setPostedById(job.getPostedBy().getId());
            dto.setPostedByName(job.getPostedBy().getCompanyName());
        }

        // 🔥 Lấy danh sách kỹ năng từ JobSkill
        if (job.getJobSkills() != null) {
            dto.setSkills(
                    job.getJobSkills().stream()
                            .map(js -> js.getSkill().getName())
                            .distinct()
                            .toList()
            );
        }

        if (job.getJobApplications() != null) {
            dto.setTotalApplications((long) job.getJobApplications().size());
        }

        // ✅ Gắn cờ reported
        boolean isReported = job.getVisible() != null && job.getVisible();
        dto.setVisible(isReported);

        // ✅ Nếu có report (ReportType.JOB), lấy thông tin chi tiết
//        List<Report> jobReports = reportRepository.findByReportedItemTypeAndReportedItemId(ReportType.JOB, job.getId());

//        if (!jobReports.isEmpty()) {
//            dto.setReportReason(jobReports.get(0).getReason());
//            dto.setReportCount(jobReports.size());
//            dto.setReportStatus(jobReports.get(0).getStatus().name());
//            dto.setReportSeverity(jobReports.get(0).getSeverity().name());
//        }



        return dto;
    }

    private Jobs mapToEntity(JobDto dto)
    {
        Jobs job = new Jobs();
        job.setId(dto.getId());
        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setLocation(dto.getLocation());
        job.setSalaryMin(dto.getSalaryMin());
        job.setSalaryMax(dto.getSalaryMax());
        job.setJobIMG(dto.getJobIMG());
        job.setJobType(dto.getJobType());
        job.setLevel(dto.getLevel());
        job.setStatus(JobStatus.valueOf(dto.getStatus()));
        job.setViewsCount(dto.getViewsCount() != null ? dto.getViewsCount() : 0);
        job.setFeatured(dto.getFeatured() != null ? dto.getFeatured() : false);
        job.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : LocalDateTime.now());
        job.setUpdatedAt(LocalDateTime.now());
        job.setRequiredExperience(dto.getRequiredExperience());
        job.setRequirements(dto.getRequirements() != null ? dto.getRequirements() : new ArrayList<>());
        job.setVisible(dto.getVisible() != null ? dto.getVisible() : false);
        job.setBenefit(dto.getBenefit() != null ? dto.getBenefit() : null);

        if (dto.getIndustryId() != null)
        {
            Industry industry = industryRepository.findById(dto.getIndustryId())
                    .orElseThrow(() -> new RuntimeException("Industry not found"));
            job.setIndustry(industry);
        }
        if (dto.getPostedById() != null)
        {
            EmployerProfiles employerProfiles = employerProfilesRepository.findByUserId(dto.getPostedById())
                    .orElseThrow(() -> new RuntimeException("Employer not found for user ID " + dto.getPostedById()));
            job.setPostedBy(employerProfiles);
        }

        return job;
    }

    @Transactional
    @Override
    public JobDto createOrUpdateJob(JobDto jobDto) {
        Jobs job;
        boolean isUpdate = jobDto.getId() != null;

        // 1. Tải Job entity (NẾU LÀ UPDATE)
        if (isUpdate) {
            job = jobRepository.findById(jobDto.getId())
                    .orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobDto.getId()));
            // Cập nhật các trường đơn giản của 'job' từ 'jobDto'
            // ...

        } else {
            // NẾU LÀ CREATE
            job = mapToEntity(jobDto);
        }

        // ... (logic gán Employer Profiles) ...

        // 2. Xử lý KỸ NĂNG: Thao tác trực tiếp trên tập hợp
        if (jobDto.getSkills() != null) {

            // A. Xóa tất cả các liên kết JobSkill cũ khỏi tập hợp
            // Nhờ orphanRemoval=true, Hibernate sẽ DELETE chúng khi commit.
            job.getJobSkills().clear();

            // B. Thêm các liên kết JobSkill mới vào tập hợp
            jobDto.getSkills().forEach(skillName -> {
                // Tìm hoặc tạo Skill (đảm bảo Skill đã được lưu/quản lý)
                Skills skill = skillRepository.findByName(skillName)
                        .orElseGet(() -> {
                            Skills newSkill = new Skills();
                            newSkill.setName(skillName);
                            return skillRepository.save(newSkill); // Lưu Skill mới nếu cần
                        });

                // Tạo đối tượng JobSkill mới và gán mối quan hệ
                JobSkill js = new JobSkill();
                js.setJob(job);
                js.setSkill(skill);
                // Gán ID cho khóa kép (cần thiết nếu JobSkillId là @Embeddable)
                js.setId(new JobSkillId(job.getId() != null ? job.getId() : -1L, skill.getId()));

                // ✅ THÊM VÀO TẬP HỢP CỦA ENTITY CHÍNH
                job.getJobSkills().add(js);
            });

        } else if (isUpdate) {
            // Nếu là update và không có skills, xóa tất cả skills cũ
            job.getJobSkills().clear();
        }

        // 3. Lưu Jobs (Hibernate tự xử lý JobSkills qua Cascade và orphanRemoval)
        Jobs savedJob = jobRepository.save(job);

        // ✅ Gửi thông báo
        Long employerId = savedJob.getPostedBy().getUser().getId();
        if (isUpdate) {
            notificationBuilder.notifyEmployer(
                    employerId,
                    NotificationType.JOB_UPDATED,
                    "Your job '" + savedJob.getTitle() + "' has been updated successfully."
            );
        } else {
            notificationBuilder.notifyEmployer(
                    employerId,
                    NotificationType.JOB_CREATED,
                    "Your job '" + savedJob.getTitle() + "' has been posted successfully."
            );
            notificationBuilder.notifyAllAdmins(
                    NotificationType.JOB_CREATED,
                    "New job created: '" + savedJob.getTitle() + "'."
            );
        }


        return mapToDto(savedJob);
    }

    @Override
    public Page<JobDto> getEmployerJobs(Long employerId, String status, int page, int size, String sortBy, String sortDir) {
        // 1. Tạo đối tượng Sort
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        // 2. Tạo đối tượng Pageable
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Jobs> jobsPage;

        // 3. Xử lý Lọc theo Status
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                JobStatus jobStatus = JobStatus.valueOf(status.toUpperCase());
                jobsPage = jobRepository.findByPostedBy_IdAndStatus(employerId, jobStatus, pageable);
            } catch (IllegalArgumentException e) {
                // Xử lý nếu status không hợp lệ
                throw new RuntimeException("Invalid job status: " + status);
            }
        } else {
            // Lấy tất cả Jobs của Employer (không lọc Status)
            jobsPage = jobRepository.findByPostedBy_Id(employerId, pageable);
        }

        // 4. Map sang DTO và trả về Page<JobDto>
        return jobsPage.map(this::mapToDto);
    }

    // ✅ PHƯƠNG THỨC MỚI: Cập nhật trạng thái Job (Pause/Activate/Close)
    @Override
    @Transactional
    public JobDto updateJobStatus(Long jobId, String status) {
        Jobs job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        try {
            JobStatus newStatus = JobStatus.valueOf(status.toUpperCase());
            job.setStatus(newStatus);
            job.setUpdatedAt(LocalDateTime.now());
            jobRepository.save(job);

            // ✅ Gửi thông báo khi job bị đóng / kích hoạt
            notificationBuilder.notifyEmployer(
                    job.getPostedBy().getUser().getId(),
                    NotificationType.JOB_UPDATED,
                    "The status of your job '" + job.getTitle() + "' has been updated to " + newStatus + "."
            );

            return mapToDto(job);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid job status value: " + status);
        }
    }

    @Transactional
    @Override
    public JobDto updateJob(Long id, JobDto dto) {
        Jobs job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with ID: " + id));

        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setLocation(dto.getLocation());
        job.setSalaryMin(dto.getSalaryMin());
        job.setSalaryMax(dto.getSalaryMax());
        job.setLevel(dto.getLevel());
        job.setJobType(dto.getJobType());
        job.setFeatured(dto.getFeatured());
        job.setStatus(dto.getStatus() != null
                ? JobStatus.valueOf(dto.getStatus().toUpperCase())
                : JobStatus.OPEN);
        job.setRequiredExperience(dto.getRequiredExperience());

        job.getRequirements().clear();
        if (dto.getRequirements() != null && !dto.getRequirements().isEmpty()) {
            job.getRequirements().addAll(dto.getRequirements());
        }

        if (dto.getIndustryId() != null) {
            Industry industry = industryRepository.findById(dto.getIndustryId())
                    .orElseThrow(() -> new RuntimeException("Industry not found"));
            job.setIndustry(industry);
        }

        if (dto.getJobIMG() != null && !dto.getJobIMG().isEmpty()) {
            job.setJobIMG(dto.getJobIMG());
        }

        jobRepository.save(job);
        return mapToDto(job);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobDto> getAllJobsForAdmin(JobStatus status, Pageable pageable) {
        Page<Jobs> jobsPage;
        if (status != null) {
            // Cần phương thức findByStatus trong JobRepository
            jobsPage = jobRepository.findByStatus(status, pageable);
        } else {
            // Lấy tất cả, đã có sẵn
            jobsPage = jobRepository.findAll(pageable);
        }
        return jobsPage.map(this::mapToDto);
    }


    @Override
    public List<JobDto> searchJobs(String keyword, String location) {
        List<Jobs> jobs;

        if (keyword != null && location != null) {
            jobs = jobRepository.findByTitleContainingIgnoreCaseOrIndustry_NameContainingIgnoreCase(keyword, keyword)
                    .stream()
                    .filter(j -> j.getLocation() != null &&
                            j.getLocation().toLowerCase(Locale.ROOT).contains(location.toLowerCase(Locale.ROOT)))
                    .collect(Collectors.toList());
        } else if (keyword != null) {
            jobs = jobRepository.findByTitleContainingIgnoreCaseOrIndustry_NameContainingIgnoreCase(keyword, keyword);
        } else {
            jobs = jobRepository.findAll();
        }

        return jobs.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobDto> findByIndustryId(Long industryId) {
        List<Jobs> jobs = jobRepository.findByIndustryId(industryId);
        return jobs.stream().map(this::mapToDto).toList();
    }

    @Override
    public List<JobDto> findByLocation(String location) {
        return jobRepository.findByLocationIgnoreCase(location)
                .stream().map(this::mapToDto)
                .collect(Collectors.toList());
    }


    @Override
    public List<JobDto> findByIndustryAndLocation(Long industryId, String location) {
        return jobRepository.findByIndustryIdAndLocationIgnoreCase(industryId, location)
                .stream().map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobDto> getJobsByVisibility(int visible) {
        return jobRepository.findByVisible(visible)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    public List<JobDto> searchJobsAdvanced(JobSearchCriteria criteria) {
        Specification<Jobs> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Status & Visible
            predicates.add(cb.equal(root.get("status"), JobStatus.OPEN));
            predicates.add(cb.equal(root.get("visible"), true));

            // 2. TÌM THEO TỪ KHÓA CHUNG (Query) - SỬA LẠI ĐỂ CHẶT CHẼ HƠN
            if (criteria.getQuery() != null && !criteria.getQuery().isEmpty()) {
                String keyword = criteria.getQuery().toLowerCase();
                // Chỉ tìm trong Title (Tiêu đề) để đỡ bị nhiễu hơn là tìm cả trong Description
                Predicate titlePred = cb.like(cb.lower(root.get("title")), "%" + keyword + "%");
                predicates.add(titlePred);
            }

            // 3. TÌM THEO NGÀNH (INDUSTRY)
            if (criteria.getIndustry() != null && !criteria.getIndustry().isEmpty()) {
                // Join bảng Industry và tìm theo tên ngành
                Predicate industryPred = cb.like(
                        cb.lower(root.get("industry").get("name")),
                        "%" + criteria.getIndustry().toLowerCase() + "%"
                );
                predicates.add(industryPred);
            }

            // 4. Location
            if (criteria.getLocation() != null && !criteria.getLocation().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + criteria.getLocation().toLowerCase() + "%"));
            }

            if (criteria.getExcludeLocation() != null && !criteria.getExcludeLocation().isEmpty()) {
                // notLike: Loại bỏ các job có địa điểm chứa từ khóa này
                predicates.add(cb.notLike(cb.lower(root.get("location")), "%" + criteria.getExcludeLocation().toLowerCase() + "%"));
            }

            // 5. Salary
            if (criteria.getMinSalary() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("salaryMax"), criteria.getMinSalary()));
            }

            // 6. Skills
            if (criteria.getSkills() != null && !criteria.getSkills().isEmpty()) {
                Join<Jobs, JobSkill> jobSkillJoin = root.join("jobSkills", JoinType.INNER);
                Join<JobSkill, Skills> skillJoin = jobSkillJoin.join("skill", JoinType.INNER);
                List<Predicate> skillPredicates = new ArrayList<>();
                for (String skillName : criteria.getSkills()) {
                    skillPredicates.add(cb.like(cb.lower(skillJoin.get("name")), "%" + skillName.toLowerCase() + "%"));
                }
                predicates.add(cb.or(skillPredicates.toArray(new Predicate[0])));
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<Jobs> matchedJobs = jobRepository.findAll(spec);
        return matchedJobs.stream().limit(10).map(this::mapToDto).collect(Collectors.toList());
    }

}


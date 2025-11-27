package com.example.JobPortal.model;

import com.example.JobPortal.enums.ExperienceLevels;
import com.example.JobPortal.enums.JobStatus;
import com.example.JobPortal.enums.JobType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// Jobs.java
@Entity
@Table(name = "Jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Jobs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String description;
    private String location;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    private String JobIMG;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    private ExperienceLevels level;

    @ManyToOne
    @JoinColumn(name = "posted_by", nullable = false)
    private EmployerProfiles postedBy;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.OPEN;

    private Boolean featured = false;

    private LocalDateTime deadline;
    private Integer viewsCount = 0;

    @ManyToOne
    @JoinColumn(name = "industry_id", nullable = false)
    private Industry industry;

    private Integer requiredExperience;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "job_requirements",
            joinColumns = @JoinColumn(name = "job_id")
    )
    @Column(name = "requirements")
    private List<String> requirements = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "job_benefits",
            joinColumns = @JoinColumn(name = "job_id")
    )
    @Column(name = "benefit")
    private List<String> benefit = new ArrayList<>();





    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER)
    private Set<JobSkill> jobSkills = new HashSet<>();

    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<Applications> jobApplications = new HashSet<>();

    @Column(nullable = false)
    private Boolean visible = false;




    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Jobs(Object o, String reactDev, Industry tech, User employer, String desc, String s, double v, double v1, String req, String benefits, String location, JobStatus jobStatus, LocalDateTime now, long l, Object o1, Object o2) {
    }
}



package com.example.JobPortal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// EmployerProfiles.java
@Entity
@Table(name = "EmployerProfiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployerProfiles {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String companyName;
    private String companyAddress;
    private String companySize;
    private String contactEmail;
    private String companyNumber;
    private String companyLogo;

    @Column(length = 1000)
    private String companyIMG;

    private String companyDescription;
    private String website;
    private Integer foundedYear;

    @OneToMany(mappedBy = "postedBy", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Jobs> jobs = new ArrayList<>();


    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}


package com.example.JobPortal.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// CandidateProfiles.java
@Entity
@Table(name = "CandidateProfiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfiles {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Integer experienceYears;
    private String education;
    private String candidateIMG;
    private String bio;
    private LocalDateTime birthdate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "candidate_cvs", joinColumns = @JoinColumn(name = "candidate_id"))
    @Column(name = "cv_url")
    private List<String> cvs = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
}

package com.example.JobPortal.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CandidateProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Integer experienceYears;
    private String education;
    private String candidateIMG;
    private List<String> cvs;
    private String bio;
    private String isActive;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDate birthdate;

}


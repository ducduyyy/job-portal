package com.example.JobPortal.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter
public class CandidateProfileRequest {
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Integer experienceYears;
    private String education;
    private String candidateIMG;
    private List<String> cvs;
    private String bio;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDate birthdate;

}

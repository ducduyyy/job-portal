package com.example.JobPortal.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter @Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class EmployerProfileRequest {
    private String companyName;
    private String companyAddress;
    private String companySize;
    private String contactEmail;
    private String companyNumber;
    private String companyLogo;
    private String companyIMG;
    private String companyDescription;
    private String website;
    private Integer foundedYear;
}
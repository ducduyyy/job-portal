package com.example.JobPortal.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class JobSearchCriteria {
    private String query;
    private String location;
    private String excludeLocation;
    private BigDecimal minSalary;
    private String jobType;
    private String industry;
    private List<String> skills;
}
// src/main/java/com/example/JobPortal/dto/UpdateReportStatusRequest.java
package com.example.JobPortal.dto;
import com.example.JobPortal.enums.ReportStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateReportStatusRequest(@NotNull ReportStatus status) {}
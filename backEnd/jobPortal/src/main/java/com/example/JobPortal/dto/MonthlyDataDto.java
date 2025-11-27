package com.example.JobPortal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyDataDto {

    private String month;
    private long applications;
    private long views;

    private long count;

    private long users;
    private long jobs;

    // ✅ Constructor đúng cho query trong UserRepository
    public MonthlyDataDto(String month, Long count) {
        this.month = month;
        this.count = (count != null) ? count : 0L;
    }

    // ✅ Constructor cho UserRepository & JobRepository
    public MonthlyDataDto(String month, Long users, Long jobs) {
        this.month = month;
        this.users = (users != null) ? users : 0L;
        this.jobs = (jobs != null) ? jobs : 0L;
    }

    public MonthlyDataDto(String month, Long applications, Long views, boolean dummy) {
        this.month = month;
        this.applications = (applications != null) ? applications : 0L;
        this.views = (views != null) ? views : 0L;
    }
}

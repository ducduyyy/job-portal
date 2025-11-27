package com.example.JobPortal.dto.chat;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageResponse {
    private String reply;
    private List<JobSuggestionDto> jobs;
    private Long conversationId;
}

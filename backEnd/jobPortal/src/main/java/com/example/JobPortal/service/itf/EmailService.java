package com.example.JobPortal.service.itf;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
    void sendCandidateApprovedMail(String candidateEmail, String jobTitle, String employerEmail);

    // Candidate events
    void sendCandidateAppliedMail(String candidateEmail, String jobTitle);
    void sendCandidateApprovedMail(String candidateEmail, String jobTitle);
    void sendCandidateRejectedMail(String candidateEmail, String jobTitle);
    void sendForgotPasswordMail(String candidateEmail, String resetLink);

    // Employer events
    void sendJobReportedMail(String employerEmail, String jobTitle);
    void sendCandidateApplicationResult(String candidateEmail, String jobTitle, boolean approved);

    // Admin actions
    void sendAccountBlockedMail(String email, String reason);
    void sendAccountDeletedMail(String email, String reason);

    // 📣 Reports
    void sendCandidateReportConfirmationMail(String candidateEmail, String jobTitle, String reason);
    void sendEmployerJobReportedMail(String employerEmail, String jobTitle);

    // 📬 Job Lifecycle
    void sendJobCreatedMail(String employerEmail, String jobTitle);
    void sendJobDeletedMail(String employerEmail, String jobTitle);

    // 📤 Application Events
    void sendEmployerNewApplicationMail(String employerEmail, String jobTitle, String candidateName);
    void sendCandidateApplicationConfirmationMail(String candidateEmail, String jobTitle);

}

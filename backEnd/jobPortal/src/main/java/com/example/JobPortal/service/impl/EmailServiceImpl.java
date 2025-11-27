package com.example.JobPortal.service.impl;

import com.example.JobPortal.service.itf.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    private final String VERIFIED_SENDER = "duyn9946@gmail.com"; // đã xác thực trên SendGrid
    private final String SENDER_DISPLAY_NAME = "Job Portal Team";

    /**
     * Gửi email chuẩn — cho phép đặt tên hiển thị và reply-to
     */
    public void sendEmail(String to, String subject, String body, String replyTo) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(VERIFIED_SENDER, SENDER_DISPLAY_NAME);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);

            if (replyTo != null && !replyTo.isEmpty()) {
                helper.setReplyTo(replyTo);
            }

            mailSender.send(message);
        } catch (jakarta.mail.MessagingException | UnsupportedEncodingException e) {
            throw new MailSendException("Failed to send email", e);
        }
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        sendEmail(to, subject, body, null);
    }

    // =====================================================
    // 🧑‍🎓 Candidate
    // =====================================================

    @Override
    public void sendCandidateAppliedMail(String candidateEmail, String jobTitle) {
        sendEmail(candidateEmail,
                "Application Successful",
                "Dear candidate,\n\nYou have successfully applied for the position: " + jobTitle +
                        ".\n\nWe will review your application and contact you soon.\n\nBest regards,\nJobPortal Team");
    }

    @Override
    public void sendForgotPasswordMail(String candidateEmail, String resetLink) {
        sendEmail(candidateEmail,
                "Reset Your Password",
                "Dear user,\n\nClick the following link to reset your password:\n" + resetLink +
                        "\n\nIf you did not request this action, please ignore this message.\n\nBest regards,\nJobPortal Team");
    }

    @Override
    public void sendCandidateApprovedMail(String candidateEmail, String jobTitle) {
        sendEmail(candidateEmail,
                "Application Approved",
                "Congratulations!\n\nYour application for the job '" + jobTitle +
                        "' has been approved.\n\nWe will contact you for the next steps.\n\nBest regards,\nJobPortal Team");
    }

    @Override
    public void sendCandidateApprovedMail(String candidateEmail, String jobTitle, String employerEmail) {
        String subject = "Application Approved";
        String body = "Congratulations!\n\nYour application for the job '" + jobTitle +
                "' has been approved.\n\nWe will contact you soon.\n\nBest regards,\nJobPortal Team";
        sendEmail(candidateEmail, subject, body, employerEmail);
    }

    @Override
    public void sendCandidateRejectedMail(String candidateEmail, String jobTitle) {
        sendEmail(candidateEmail,
                "Application Result",
                "Dear candidate,\n\nWe appreciate your interest in the '" + jobTitle +
                        "' position, but we have decided to move forward with other candidates.\n\nBest wishes,\nJobPortal Team");
    }

    // =====================================================
    // 🏢 Employer
    // =====================================================

    @Override
    public void sendJobReportedMail(String employerEmail, String jobTitle) {
        sendEmail(employerEmail,
                "Job Report Notification",
                "Dear employer,\n\nYour job posting '" + jobTitle +
                        "' has been reported by users.\nPlease review and update it as needed.\n\nBest regards,\nJobPortal Team");
    }

    @Override
    public void sendCandidateApplicationResult(String candidateEmail, String jobTitle, boolean approved) {
        if (approved) sendCandidateApprovedMail(candidateEmail, jobTitle);
        else sendCandidateRejectedMail(candidateEmail, jobTitle);
    }

    // =====================================================
    // 🧑‍⚖️ Admin
    // =====================================================

    @Override
    public void sendAccountBlockedMail(String email, String reason) {
        sendEmail(email,
                "Account Blocked",
                "Dear user,\n\nYour account has been blocked for the following reason:\n" + reason +
                        "\n\nIf you believe this was a mistake, please contact support.\n\nBest regards,\nJobPortal Admin Team");
    }

    @Override
    public void sendAccountDeletedMail(String email, String reason) {
        sendEmail(email,
                "Account Deleted",
                "Dear user,\n\nYour account has been permanently deleted.\nReason: " + reason +
                        "\n\nWe’re sorry to see you go.\n\nBest regards,\nJobPortal Admin Team");
    }

    // =====================================================
// 📣 Reports & Notifications
// =====================================================

    @Override
    public void sendCandidateReportConfirmationMail(String candidateEmail, String jobTitle, String reason) {
        sendEmail(candidateEmail,
                "Job Report Submitted Successfully",
                "Dear candidate,\n\nThank you for reporting the job '" + jobTitle + "'."
                        + "\n\nReason: " + reason
                        + "\n\nOur admin team will review your report shortly."
                        + "\n\nBest regards,\nJobPortal Team");
    }

    @Override
    public void sendEmployerJobReportedMail(String employerEmail, String jobTitle) {
        sendEmail(employerEmail,
                "Job Report Notification",
                "Dear employer,\n\nYour job posting '" + jobTitle
                        + "' has been reported by users."
                        + "\n\nPlease review and update it as necessary."
                        + "\n\nBest regards,\nJobPortal Team");
    }

// =====================================================
// 📬 Job Lifecycle
// =====================================================

    @Override
    public void sendJobCreatedMail(String employerEmail, String jobTitle) {
        sendEmail(employerEmail,
                "Job Posted Successfully",
                "Dear employer,\n\nYour job '" + jobTitle +
                        "' has been successfully posted on JobPortal.\n\nBest regards,\nJobPortal Team");
    }

    @Override
    public void sendJobDeletedMail(String employerEmail, String jobTitle) {
        sendEmail(employerEmail,
                "Job Deleted Successfully",
                "Dear employer,\n\nYour job posting '" + jobTitle +
                        "' has been deleted from the platform.\n\nBest regards,\nJobPortal Team");
    }

// =====================================================
// 📤 Application Events
// =====================================================

    @Override
    public void sendEmployerNewApplicationMail(String employerEmail, String jobTitle, String candidateName) {
        sendEmail(employerEmail,
                "New Application Received",
                "Dear employer,\n\nYou have received a new application for your job posting '" + jobTitle +
                        "' from candidate: " + candidateName + ".\n\nBest regards,\nJobPortal Team");
    }

    @Override
    public void sendCandidateApplicationConfirmationMail(String candidateEmail, String jobTitle) {
        sendEmail(candidateEmail,
                "Application Submitted Successfully",
                "Dear candidate,\n\nYour application for the job '" + jobTitle +
                        "' has been submitted successfully.\n\nBest regards,\nJobPortal Team");
    }

}

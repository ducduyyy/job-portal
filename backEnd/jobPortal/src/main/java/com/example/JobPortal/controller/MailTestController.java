package com.example.JobPortal.controller;

import com.example.JobPortal.service.itf.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailTestController {

    private final EmailService emailService;

    @PostMapping("/test")
    public String testSendMail(@RequestParam String to,
                               @RequestParam String type,
                               // Thêm tham số này, không bắt buộc
                               @RequestParam(required = false) String employerEmail) {

        switch (type) {
            case "apply":
                emailService.sendCandidateAppliedMail(to, "Java Developer");
                break;

            // === THÊM CASE NÀY ĐỂ TEST REPLY-TO ===
            case "approve":
                // Nếu không cung cấp, dùng email mặc định để test
                String from = (employerEmail != null) ? employerEmail : "default.employer@test.com";
                // Gọi phương thức mới của bạn
                emailService.sendCandidateApprovedMail(to, "Senior Java Developer", from);
                break;
            // ======================================

            case "report":
                emailService.sendJobReportedMail(to, "Frontend Engineer");
                break;
            case "reset":
                emailService.sendForgotPasswordMail(to, "https://jobportal/reset?token=xyz");
                break;
            default:
                emailService.sendEmail(to, "Test Mail (from /test)", "This is a test message.");
                break;
        }
        return "Mail sent to " + to;
    }

    // Endpoint test đơn giản (vẫn giữ nguyên)
    @PostMapping("/simple-test")
    public String testSimpleSendMail(@RequestParam String to, @RequestParam String message) {
        try {
            emailService.sendEmail(to, "Simple Test Mail", message);
            return "SUCCESS: Mail sent to " + to + " with message: " + message;
        } catch (Exception e) {
            return "ERROR: " + e.getMessage();
        }
    }
}
package com.example.JobPortal.service.util;

import com.example.JobPortal.controller.NotificationStreamController;
import com.example.JobPortal.enums.NotificationType;
import com.example.JobPortal.model.Notification;
import com.example.JobPortal.model.User;
import com.example.JobPortal.repository.NotificationRepository;
import com.example.JobPortal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationBuilder {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private void create(Long userId, NotificationType type, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found for notification"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setMessage(message);
        notificationRepository.save(notification);

        // ✅ Gửi realtime SSE
        try {
            NotificationStreamController.sendToUser(userId, notification);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to send SSE notification to userId=" + userId + ": " + e.getMessage());
            // không ném lại lỗi để tránh 401 bị trả về client
        }
    }

    public void notifyCandidate(Long userId, NotificationType type, String message) {
        create(userId, type, message);
    }

    public void notifyEmployer(Long userId, NotificationType type, String message) {
        create(userId, type, message);
    }

    public void notifyAdmin(Long userId, NotificationType type, String message) {
        create(userId, type, message);
    }

    public void notifyAllAdmins(NotificationType type, String message) {
        userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("ADMIN"))
                .forEach(admin -> create(admin.getId(), type, message));
    }
}

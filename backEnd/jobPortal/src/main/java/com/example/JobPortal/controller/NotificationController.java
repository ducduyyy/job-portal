package com.example.JobPortal.controller;

import com.example.JobPortal.model.Notification;
import com.example.JobPortal.service.itf.NotificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "notification-controller", description = "Quản lý thông tin thông báo tới người dùng")
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/{userId}")
    public ResponseEntity<Notification> createNotification(
            @PathVariable Long userId,
            @RequestParam String message,
            @RequestParam(required = false) String type) {

        Notification notification = notificationService.createNotification(userId, message, type);
        NotificationStreamController.sendToUser(userId, notification);
        return ResponseEntity.ok(notification);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }

    // 🔹 Mark all as read
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }

}



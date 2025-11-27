package com.example.JobPortal.service.itf;

import com.example.JobPortal.model.Notification;

import java.util.List;

public interface NotificationService {
    Notification createNotification(Long userId, String message);
    Notification createNotification(Long userId, String message, String type);
    List<Notification> getUserNotifications(Long userId);
    void markAsRead(Long notificationId);

    void markAllAsRead(Long userId);

    void deleteNotification(Long notificationId);
}

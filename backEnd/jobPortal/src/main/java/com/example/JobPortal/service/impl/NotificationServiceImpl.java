package com.example.JobPortal.service.impl;

import com.example.JobPortal.controller.NotificationStreamController;
import com.example.JobPortal.enums.NotificationType;
import com.example.JobPortal.model.Notification;
import com.example.JobPortal.model.User;
import com.example.JobPortal.repository.NotificationRepository;
import com.example.JobPortal.repository.UserRepository;
import com.example.JobPortal.service.itf.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public Notification createNotification(Long userId, String message) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        return notificationRepository.save(notification);
    }

    // implementation
    @Override
    public Notification createNotification(Long userId, String message, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(NotificationType.valueOf(type));
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);

        // Gửi realtime nếu có emitter
        NotificationStreamController.sendToUser(userId, saved);
        return saved;
    }


    @Override
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUser_Id(userId)
                .stream()
                .peek(n -> n.setUser(null))
                .toList();
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUser_Id(userId);
        list.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(list);
    }

    @Override
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }


}

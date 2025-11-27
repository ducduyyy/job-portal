package com.example.JobPortal.controller;

import com.example.JobPortal.model.Notification;
import com.example.JobPortal.repository.NotificationRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/notifications/stream")
@RequiredArgsConstructor
@Tag(name = "notification-controller", description = "Quản lý thông tin thông báo tới người dùng")
public class NotificationStreamController {

    private static final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    @GetMapping(value = "/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter connect(@PathVariable Long userId) {
        SseEmitter emitter = new SseEmitter(0L); // không timeout
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError(e -> emitters.remove(userId));

        // Gửi ping test để giữ kết nối
        try {
            emitter.send(SseEmitter.event().name("connect").data("connected"));
        } catch (IOException ignored) {}

        return emitter;
    }

    public static void sendToUser(Long userId, Notification notification) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(notification));
            } catch (IOException e) {
                emitters.remove(userId);
            }
        }
    }

    public static void broadcastToAdmins(List<Long> adminIds, Notification notification) {
        adminIds.forEach(id -> sendToUser(id, notification));
    }
}


package com.example.Banking.notification.controller;

import com.example.Banking.notification.service.NotificationService;
import com.example.Banking.notification.service.SseEmitterManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.UUID;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping(value = "/api/notifications", produces = APPLICATION_JSON_VALUE)
public class NotificationController {

    private final NotificationService notificationService;
    private final SseEmitterManager sseEmitterManager;

    public NotificationController(NotificationService notificationService,
                                  SseEmitterManager sseEmitterManager) {
        this.notificationService = notificationService;
        this.sseEmitterManager = sseEmitterManager;
    }

    @GetMapping
    public Page<NotificationResponse> list(Authentication auth,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        UUID userId = UUID.fromString(auth.getName());
        return notificationService.getNotifications(userId, PageRequest.of(page, size));
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return Map.of("count", notificationService.getUnreadCount(userId));
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        notificationService.markAsRead(id, userId);
    }

    @PutMapping("/read-all")
    public void markAllAsRead(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        notificationService.markAllAsRead(userId);
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return sseEmitterManager.createEmitter(userId);
    }
}

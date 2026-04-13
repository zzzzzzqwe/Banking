package com.example.Banking.notification.service;

import com.example.Banking.notification.controller.NotificationResponse;
import com.example.Banking.notification.model.Notification;
import com.example.Banking.notification.model.NotificationType;
import com.example.Banking.notification.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final SseEmitterManager sseEmitterManager;

    public NotificationService(NotificationRepository notificationRepo,
                               SseEmitterManager sseEmitterManager) {
        this.notificationRepo = notificationRepo;
        this.sseEmitterManager = sseEmitterManager;
    }

    public void createNotification(UUID userId, String title, String message, NotificationType type) {
        var notification = new Notification(
                UUID.randomUUID(), userId, title, message, type, LocalDateTime.now()
        );
        notificationRepo.save(notification);
        sseEmitterManager.pushToUser(userId, NotificationResponse.from(notification));
    }

    public Page<NotificationResponse> getNotifications(UUID userId, Pageable pageable) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationResponse::from);
    }

    public long getUnreadCount(UUID userId) {
        return notificationRepo.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        var notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Access denied");
        }
        notification.setRead(true);
        notificationRepo.save(notification);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepo.markAllAsRead(userId);
    }
}

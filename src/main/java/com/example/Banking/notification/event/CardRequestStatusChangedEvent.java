package com.example.Banking.notification.event;

import java.util.UUID;

public record CardRequestStatusChangedEvent(
        String userEmail,
        String firstName,
        UUID accountId,
        String requestType,
        String newStatus
) {}

package com.example.Banking.cardrequest.controller;

import java.time.LocalDateTime;
import java.util.UUID;

public record CardRequestResponse(
        UUID id,
        UUID userId,
        UUID accountId,
        String requestType,
        String status,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt,
        String cardNumber,
        String holderName
) {}

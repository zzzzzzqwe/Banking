package com.example.Banking.account.adapter.web;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        UUID ownerId,
        BigDecimal balance,
        String currency,
        LocalDateTime createdAt
) {}
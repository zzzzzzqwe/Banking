package com.example.Banking.notification.event;

import java.math.BigDecimal;
import java.util.UUID;

public record DailyLimitReachedEvent(
        UUID userId,
        String cardNumber,
        String currency,
        BigDecimal dailyLimit,
        BigDecimal spentToday
) {}

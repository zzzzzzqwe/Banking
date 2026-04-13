package com.example.Banking.notification.event;

import java.math.BigDecimal;
import java.util.UUID;

public record SavingsGoalCompletedEvent(
        UUID userId,
        String email,
        String firstName,
        String goalName,
        BigDecimal targetAmount,
        String currency
) {}

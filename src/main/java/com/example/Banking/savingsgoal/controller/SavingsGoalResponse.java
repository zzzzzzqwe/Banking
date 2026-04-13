package com.example.Banking.savingsgoal.controller;

import com.example.Banking.savingsgoal.model.SavingsGoal;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record SavingsGoalResponse(
        UUID id,
        UUID userId,
        UUID accountId,
        String name,
        String description,
        BigDecimal targetAmount,
        BigDecimal currentAmount,
        String currency,
        boolean completed,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime completedAt
) {
    public static SavingsGoalResponse from(SavingsGoal g) {
        return new SavingsGoalResponse(
                g.getId(), g.getUserId(), g.getAccountId(),
                g.getName(), g.getDescription(),
                g.getTargetAmount(), g.getCurrentAmount(), g.getCurrency(),
                g.isCompleted(), g.getCreatedAt(), g.getUpdatedAt(), g.getCompletedAt()
        );
    }
}

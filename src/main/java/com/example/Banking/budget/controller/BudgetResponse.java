package com.example.Banking.budget.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record BudgetResponse(
        UUID id,
        UUID categoryId,
        String categoryCode,
        String categoryName,
        String categoryIcon,
        String categoryColor,
        String period,
        BigDecimal limitAmount,
        String currency,
        BigDecimal alertThreshold,
        LocalDate startDate,
        BigDecimal spent,
        BigDecimal remaining,
        BigDecimal percentUsed,
        LocalDate periodStart,
        LocalDate periodEnd
) {}

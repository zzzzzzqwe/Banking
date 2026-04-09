package com.example.Banking.loan.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record LoanResponse(
        UUID id,
        UUID borrowerId,
        UUID accountId,
        BigDecimal principalAmount,
        BigDecimal annualInterestRate,
        int termMonths,
        BigDecimal monthlyPayment,
        String status,
        LocalDate startDate,
        LocalDate endDate,
        LocalDateTime createdAt
) {}

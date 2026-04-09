package com.example.Banking.loan.controller;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ScheduleEntryResponse(
        int installmentNumber,
        LocalDate dueDate,
        BigDecimal principal,
        BigDecimal interest,
        BigDecimal totalPayment,
        String status,
        LocalDate paidAt
) {}

package com.example.Banking.notification.event;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record InstallmentOverdueEvent(
        String borrowerEmail,
        String firstName,
        UUID loanId,
        int installmentNumber,
        LocalDate dueDate,
        BigDecimal amount
) {}

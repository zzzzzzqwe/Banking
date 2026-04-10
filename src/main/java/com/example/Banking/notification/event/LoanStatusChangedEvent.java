package com.example.Banking.notification.event;

import java.math.BigDecimal;
import java.util.UUID;

public record LoanStatusChangedEvent(
        String borrowerEmail,
        String firstName,
        UUID loanId,
        String newStatus,
        BigDecimal monthlyPayment
) {}

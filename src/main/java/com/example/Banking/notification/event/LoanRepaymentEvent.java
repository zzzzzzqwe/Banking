package com.example.Banking.notification.event;

import java.math.BigDecimal;

public record LoanRepaymentEvent(
        String borrowerEmail,
        int installmentNumber,
        BigDecimal amount,
        int remaining
) {}

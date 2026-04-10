package com.example.Banking.notification.event;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferCompletedEvent(
        String senderEmail,
        String recipientEmail,
        BigDecimal amount,
        String currency,
        UUID transferId
) {}

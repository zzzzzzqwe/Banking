package com.example.Banking.account.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        String type,
        String currency,
        BigDecimal amount,
        Instant createdAt
) {}

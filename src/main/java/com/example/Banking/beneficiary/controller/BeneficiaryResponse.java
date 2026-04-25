package com.example.Banking.beneficiary.controller;

import java.time.LocalDateTime;
import java.util.UUID;

public record BeneficiaryResponse(
        UUID id,
        String nickname,
        String accountNumber,
        UUID accountId,
        String bankName,
        String holderName,
        String currency,
        boolean favorite,
        LocalDateTime createdAt,
        LocalDateTime lastUsedAt,
        boolean internal
) {}

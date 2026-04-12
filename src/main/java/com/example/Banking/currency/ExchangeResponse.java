package com.example.Banking.currency;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ExchangeResponse(
        UUID exchangeId,
        BigDecimal fromAmount,
        String fromCurrency,
        BigDecimal toAmount,
        String toCurrency,
        BigDecimal rate,
        Instant createdAt
) {}

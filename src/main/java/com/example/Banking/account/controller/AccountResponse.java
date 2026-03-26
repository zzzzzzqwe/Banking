package com.example.Banking.account.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AccountResponse(UUID id, UUID ownerId, BigDecimal balance, String currency, String status, LocalDateTime createdAt) {}

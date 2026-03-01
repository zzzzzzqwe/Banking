package com.example.Banking.account.adapter.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record CreateAccountRequest(
        @NotBlank String ownerId,
        @NotBlank @Pattern(regexp = "^[A-Z]{3}$", message = "currency must be 3 uppercase letters, e.g. EUR")
        String currency,
        @NotNull BigDecimal initialBalance
) {}
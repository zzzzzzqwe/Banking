package com.example.Banking.account.controller;

import jakarta.validation.constraints.NotBlank;

public record UpdateCategoryRequest(
        @NotBlank String category
) {}

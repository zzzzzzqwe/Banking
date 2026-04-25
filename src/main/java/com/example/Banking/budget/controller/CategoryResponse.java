package com.example.Banking.budget.controller;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String code,
        String name,
        String icon,
        String color,
        String type,
        boolean system
) {}

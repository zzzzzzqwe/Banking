package com.example.Banking.user.controller;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        boolean active,
        String role,
        LocalDateTime createdAt
) {}

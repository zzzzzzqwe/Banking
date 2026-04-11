package com.example.Banking.user.controller;

public record AuthResponse(String token, String userId, String role, String firstName, String lastName) {}

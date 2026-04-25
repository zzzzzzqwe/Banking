package com.example.Banking.user.controller;

import com.example.Banking.audit.model.AuditAction;
import com.example.Banking.audit.service.AuditService;
import com.example.Banking.config.security.JwtTokenProvider;
import com.example.Banking.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;

    public AuthController(UserService userService, JwtTokenProvider jwtTokenProvider,
                          AuditService auditService) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.auditService = auditService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody @Valid RegisterRequest req) {
        var user = userService.register(req.email(), req.password(), req.firstName(), req.lastName());
        String token = jwtTokenProvider.generateToken(
                user.getId().toString(), user.getEmail(), user.getRole().name());
        auditService.log(user.getId(), AuditAction.REGISTER, "User", user.getId(), req.email());
        return new AuthResponse(token, user.getId().toString(), user.getRole().name(),
                user.getFirstName(), user.getLastName());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest req) {
        var result = userService.login(req.email(), req.password());
        auditService.log(UUID.fromString(result.userId()), AuditAction.LOGIN, "User",
                UUID.fromString(result.userId()), req.email());
        return new AuthResponse(result.token(), result.userId(), result.role(),
                result.firstName(), result.lastName());
    }
}

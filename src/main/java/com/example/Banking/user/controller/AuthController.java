package com.example.Banking.user.controller;

import com.example.Banking.config.security.JwtTokenProvider;
import com.example.Banking.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(UserService userService, JwtTokenProvider jwtTokenProvider) {
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody @Valid RegisterRequest req) {
        var user = userService.register(req.email(), req.password(), req.firstName(), req.lastName());
        String token = jwtTokenProvider.generateToken(
                user.getId().toString(), user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getId().toString(), user.getRole().name(),
                user.getFirstName(), user.getLastName());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest req) {
        var result = userService.login(req.email(), req.password());
        return new AuthResponse(result.token(), result.userId(), result.role(),
                result.firstName(), result.lastName());
    }
}

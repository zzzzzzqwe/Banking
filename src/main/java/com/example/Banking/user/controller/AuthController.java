package com.example.Banking.user.controller;

import com.example.Banking.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody @Valid RegisterRequest req) {
        var user = userService.register(req.email(), req.password(), req.firstName(), req.lastName());
        return new AuthResponse(null, user.getId().toString(), user.getRole().name(),
                user.getFirstName(), user.getLastName());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest req) {
        var result = userService.login(req.email(), req.password());
        return new AuthResponse(result.token(), result.userId(), result.role(),
                result.firstName(), result.lastName());
    }
}

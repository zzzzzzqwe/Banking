package com.example.Banking.user.controller;

import com.example.Banking.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/users/me", produces = MediaType.APPLICATION_JSON_VALUE)
public class UserProfileController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserProfileController(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public UserResponse getProfile(Authentication auth) {
        var user = userRepo.findById(UUID.fromString(auth.getName()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toResponse(user);
    }

    @PatchMapping
    @Transactional
    public UserResponse updateProfile(@RequestBody UpdateProfileRequest req, Authentication auth) {
        var user = userRepo.findById(UUID.fromString(auth.getName()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (req.firstName() != null && !req.firstName().isBlank())
            user.setFirstName(req.firstName().trim());
        if (req.lastName() != null && !req.lastName().isBlank())
            user.setLastName(req.lastName().trim());
        return toResponse(userRepo.save(user));
    }

    @PostMapping("/password")
    @Transactional
    public void changePassword(@RequestBody ChangePasswordRequest req, Authentication auth) {
        var user = userRepo.findById(UUID.fromString(auth.getName()))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash()))
            throw new IllegalArgumentException("Current password is incorrect");
        if (req.newPassword() == null || req.newPassword().length() < 6)
            throw new IllegalArgumentException("New password must be at least 6 characters");
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepo.save(user);
    }

    private UserResponse toResponse(com.example.Banking.user.model.User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getFirstName(),
                u.getLastName(), u.isActive(), u.getRole().name(), u.getCreatedAt());
    }

    public record UpdateProfileRequest(String firstName, String lastName) {}
    public record ChangePasswordRequest(String currentPassword, String newPassword) {}
}

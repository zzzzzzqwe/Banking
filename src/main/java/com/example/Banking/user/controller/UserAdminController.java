package com.example.Banking.user.controller;

import com.example.Banking.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/admin/users", produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {

    private final UserRepository userRepository;

    public UserAdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public Page<UserResponse> listAll(@PageableDefault(size = 20) Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable UUID id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return toResponse(user);
    }

    @PutMapping("/{id}/deactivate")
    @Transactional
    public UserResponse deactivate(@PathVariable UUID id) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setActive(false);
        return toResponse(userRepository.save(user));
    }

    private UserResponse toResponse(com.example.Banking.user.model.User u) {
        return new UserResponse(
                u.getId(),
                u.getEmail(),
                u.getFirstName(),
                u.getLastName(),
                u.isActive(),
                u.getRole().name(),
                u.getCreatedAt()
        );
    }
}

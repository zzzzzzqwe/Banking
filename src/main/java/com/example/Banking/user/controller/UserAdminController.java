package com.example.Banking.user.controller;

import com.example.Banking.audit.model.AuditAction;
import com.example.Banking.audit.service.AuditService;
import com.example.Banking.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/admin/users", produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public UserAdminController(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
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
    public UserResponse deactivate(@PathVariable UUID id, Authentication auth) {
        var user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        user.setActive(false);
        auditService.log(UUID.fromString(auth.getName()), AuditAction.USER_DEACTIVATED,
                "User", id, user.getEmail());
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

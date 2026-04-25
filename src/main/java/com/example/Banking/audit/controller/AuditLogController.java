package com.example.Banking.audit.controller;

import com.example.Banking.audit.model.AuditAction;
import com.example.Banking.audit.model.AuditLog;
import com.example.Banking.audit.service.AuditService;
import com.example.Banking.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/api/admin/audit", produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditService auditService;
    private final UserRepository userRepository;

    public AuditLogController(AuditService auditService, UserRepository userRepository) {
        this.auditService = auditService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public Page<AuditLogResponse> list(
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @PageableDefault(size = 30) Pageable pageable
    ) {
        AuditAction parsedAction = null;
        if (action != null && !action.isBlank()) {
            try { parsedAction = AuditAction.valueOf(action); } catch (IllegalArgumentException ignored) {}
        }

        var emailCache = userRepository.findAll().stream()
                .collect(Collectors.toMap(u -> u.getId(), u -> u.getEmail()));

        Page<AuditLog> page = auditService.findFiltered(userId, parsedAction, from, to, pageable);
        return page.map(a -> toResponse(a, emailCache));
    }

    @GetMapping("/actions")
    public AuditAction[] actions() {
        return AuditAction.values();
    }

    private AuditLogResponse toResponse(AuditLog a, Map<UUID, String> emailCache) {
        return new AuditLogResponse(
                a.getId(),
                a.getUserId(),
                a.getUserId() != null ? emailCache.getOrDefault(a.getUserId(), "—") : "system",
                a.getAction().name(),
                a.getEntityType(),
                a.getEntityId(),
                a.getDetails(),
                a.getIpAddress(),
                a.getCreatedAt()
        );
    }
}

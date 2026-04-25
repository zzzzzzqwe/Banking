package com.example.Banking.audit.service;

import com.example.Banking.audit.model.AuditAction;
import com.example.Banking.audit.model.AuditLog;
import com.example.Banking.audit.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    public void log(UUID userId, AuditAction action, String entityType, UUID entityId, String details) {
        var entry = new AuditLog();
        entry.setUserId(userId);
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDetails(details);
        entry.setIpAddress(resolveIp());
        repository.save(entry);
    }

    public void log(UUID userId, AuditAction action, String entityType, UUID entityId) {
        log(userId, action, entityType, entityId, null);
    }

    @Async
    public void logAsync(UUID userId, AuditAction action, String entityType, UUID entityId, String details) {
        log(userId, action, entityType, entityId, details);
    }

    public Page<AuditLog> findAll(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<AuditLog> findFiltered(UUID userId, AuditAction action,
                                       LocalDateTime from, LocalDateTime to,
                                       Pageable pageable) {
        String actionStr = action != null ? action.name() : null;
        return repository.findFiltered(userId, actionStr, from, to, pageable);
    }

    private String resolveIp() {
        try {
            var attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return null;
            HttpServletRequest req = attrs.getRequest();
            String xff = req.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
            return req.getRemoteAddr();
        } catch (Exception e) {
            return null;
        }
    }
}

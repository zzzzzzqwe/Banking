package com.example.Banking.audit.repository;

import com.example.Banking.audit.model.AuditAction;
import com.example.Banking.audit.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query(value = "SELECT * FROM audit_log a WHERE " +
            "(CAST(:userId AS uuid) IS NULL OR a.user_id = CAST(:userId AS uuid)) AND " +
            "(CAST(:action AS varchar) IS NULL OR a.action = CAST(:action AS varchar)) AND " +
            "(CAST(:from AS timestamp) IS NULL OR a.created_at >= CAST(:from AS timestamp)) AND " +
            "(CAST(:to AS timestamp) IS NULL OR a.created_at <= CAST(:to AS timestamp)) " +
            "ORDER BY a.created_at DESC",
            countQuery = "SELECT count(*) FROM audit_log a WHERE " +
            "(CAST(:userId AS uuid) IS NULL OR a.user_id = CAST(:userId AS uuid)) AND " +
            "(CAST(:action AS varchar) IS NULL OR a.action = CAST(:action AS varchar)) AND " +
            "(CAST(:from AS timestamp) IS NULL OR a.created_at >= CAST(:from AS timestamp)) AND " +
            "(CAST(:to AS timestamp) IS NULL OR a.created_at <= CAST(:to AS timestamp))",
            nativeQuery = true)
    Page<AuditLog> findFiltered(
            @Param("userId") UUID userId,
            @Param("action") String action,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable
    );
}

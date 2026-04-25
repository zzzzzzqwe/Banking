package com.example.Banking.transaction.controller;

import com.example.Banking.audit.model.AuditAction;
import com.example.Banking.audit.service.AuditService;
import com.example.Banking.transaction.service.TransferService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferService transferService;
    private final AuditService auditService;

    public TransferController(TransferService transferService, AuditService auditService) {
        this.transferService = transferService;
        this.auditService = auditService;
    }

    @PostMapping
    public ResponseEntity<TransferResponse> transfer(
            @RequestHeader("X-Idempotency-Key") String key,
            @RequestBody @Valid TransferRequest req,
            Authentication auth
    ) {
        var txId = transferService.transfer(
                auth.getName(), req.fromAccountId, req.toAccountId, req.currency, req.amount, key
        );
        auditService.log(UUID.fromString(auth.getName()), AuditAction.TRANSFER,
                "Transfer", txId, req.amount + " " + req.currency);
        return ResponseEntity.ok(new TransferResponse(txId.toString()));
    }

    public static class TransferRequest {
        @NotBlank public String fromAccountId;
        @NotBlank public String toAccountId;
        @NotBlank public String currency;
        @NotBlank public String amount;
    }

    public record TransferResponse(String transactionId) {}
}

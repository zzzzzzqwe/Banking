package com.example.Banking.cardrequest.controller;

import com.example.Banking.account.service.AccountService;
import com.example.Banking.audit.model.AuditAction;
import com.example.Banking.audit.service.AuditService;
import com.example.Banking.cardrequest.model.CardRequest;
import com.example.Banking.cardrequest.model.CardRequestType;
import com.example.Banking.cardrequest.service.CardRequestService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class CardRequestController {

    private final CardRequestService cardRequestService;
    private final AccountService accountService;
    private final AuditService auditService;

    public CardRequestController(CardRequestService cardRequestService,
                                 AccountService accountService,
                                 AuditService auditService) {
        this.cardRequestService = cardRequestService;
        this.accountService = accountService;
        this.auditService = auditService;
    }

    @PostMapping("/api/card-requests")
    @ResponseStatus(HttpStatus.CREATED)
    public CardRequestResponse create(@RequestBody Map<String, String> body,
                                      Authentication auth) {
        UUID accountId = UUID.fromString(body.get("accountId"));
        CardRequestType type = CardRequestType.valueOf(body.get("type"));
        var request = cardRequestService.createRequest(auth.getName(), accountId, type);
        auditService.log(UUID.fromString(auth.getName()),
                type == CardRequestType.BLOCK ? AuditAction.CARD_BLOCK_REQUESTED : AuditAction.CARD_UNBLOCK_REQUESTED,
                "CardRequest", request.getId(), "account=" + accountId);
        return toResponse(request);
    }

    @GetMapping("/api/card-requests")
    public List<CardRequestResponse> myRequests(Authentication auth) {
        return cardRequestService.getUserRequests(auth.getName())
                .stream().map(this::toResponse).toList();
    }

    @GetMapping("/api/card-requests/pending")
    public List<CardRequestResponse> myPendingRequests(Authentication auth) {
        return cardRequestService.getUserPendingRequests(auth.getName())
                .stream().map(this::toResponse).toList();
    }

    // ── Admin ──

    @GetMapping("/api/admin/card-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<CardRequestResponse> allRequests(@PageableDefault(size = 20) Pageable pageable) {
        return cardRequestService.getAllRequests(pageable).map(this::toResponse);
    }

    @PostMapping("/api/admin/card-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public CardRequestResponse approve(@PathVariable UUID id, Authentication auth) {
        var req = cardRequestService.approve(id);
        AuditAction action = req.getRequestType() == CardRequestType.BLOCK
                ? AuditAction.CARD_BLOCK_APPROVED : AuditAction.CARD_UNBLOCK_APPROVED;
        auditService.log(UUID.fromString(auth.getName()), action, "CardRequest", id);
        return toResponse(req);
    }

    @PostMapping("/api/admin/card-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public CardRequestResponse reject(@PathVariable UUID id, Authentication auth) {
        var req = cardRequestService.reject(id);
        AuditAction action = req.getRequestType() == CardRequestType.BLOCK
                ? AuditAction.CARD_BLOCK_REJECTED : AuditAction.CARD_UNBLOCK_REJECTED;
        auditService.log(UUID.fromString(auth.getName()), action, "CardRequest", id);
        return toResponse(req);
    }

    private CardRequestResponse toResponse(CardRequest r) {
        String cardNumber = null;
        String holderName = null;
        try {
            var account = accountService.getById(r.getAccountId());
            cardNumber = account.getCardNumber();
            holderName = account.getHolderName();
        } catch (Exception ignored) {}

        return new CardRequestResponse(
                r.getId(),
                r.getUserId(),
                r.getAccountId(),
                r.getRequestType().name(),
                r.getStatus().name(),
                r.getCreatedAt(),
                r.getResolvedAt(),
                cardNumber,
                holderName
        );
    }
}

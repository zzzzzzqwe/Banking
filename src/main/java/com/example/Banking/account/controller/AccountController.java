package com.example.Banking.account.controller;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.service.AccountService;
import com.example.Banking.audit.model.AuditAction;
import com.example.Banking.audit.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/accounts", produces = MediaType.APPLICATION_JSON_VALUE)
public class AccountController {

    private final AccountService accountService;
    private final AuditService auditService;

    public AccountController(AccountService accountService, AuditService auditService) {
        this.accountService = accountService;
        this.auditService = auditService;
    }

    @GetMapping
    public List<AccountResponse> listAccounts(Authentication auth) {
        UUID ownerId = UUID.fromString(auth.getName());
        return accountService.findByOwnerId(ownerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public AccountResponse getById(@PathVariable("id") UUID id, Authentication auth) {
        var account = accountService.getById(id);
        verifyOwnership(account, auth);
        return toResponse(account);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateAccountResponse create(@RequestBody @Valid CreateAccountRequest req, Authentication auth) {
        var account = accountService.create(auth.getName(), req.currency(), req.initialBalance(),
                req.cardNetwork(), req.cardTier(), req.cardType());
        auditService.log(UUID.fromString(auth.getName()), AuditAction.CARD_CREATED,
                "Account", account.getId(), req.currency() + " " + req.cardNetwork());
        return new CreateAccountResponse(account.getId().toString());
    }

    @PostMapping("/{id}/deposit")
    public AccountResponse deposit(@PathVariable("id") UUID id,
                                   @RequestBody @Valid DepositRequest req,
                                   Authentication auth) {
        verifyOwnership(accountService.getById(id), auth);
        var account = accountService.deposit(id, req.currency(), req.amount(), req.category());
        auditService.log(UUID.fromString(auth.getName()), AuditAction.CARD_DEPOSIT,
                "Account", id, req.amount() + " " + req.currency());
        return toResponse(account);
    }

    @PostMapping("/{id}/withdraw")
    public AccountResponse withdraw(@PathVariable("id") UUID id,
                                    @RequestBody @Valid WithdrawRequest req,
                                    Authentication auth) {
        verifyOwnership(accountService.getById(id), auth);
        var account = accountService.withdraw(id, req.currency(), req.amount(), req.category());
        auditService.log(UUID.fromString(auth.getName()), AuditAction.CARD_WITHDRAW,
                "Account", id, req.amount() + " " + req.currency());
        return toResponse(account);
    }

    @PostMapping("/{id}/close")
    public AccountResponse close(@PathVariable("id") UUID id, Authentication auth) {
        verifyOwnership(accountService.getById(id), auth);
        var account = accountService.close(id);
        auditService.log(UUID.fromString(auth.getName()), AuditAction.CARD_CLOSED, "Account", id);
        return toResponse(account);
    }

    @PutMapping("/{id}/limit")
    public AccountResponse setLimit(@PathVariable("id") UUID id,
                                    @RequestBody Map<String, Object> body,
                                    Authentication auth) {
        verifyOwnership(accountService.getById(id), auth);
        BigDecimal limit = body.get("dailyLimit") == null ? null : new BigDecimal(body.get("dailyLimit").toString());
        var account = accountService.setDailyLimit(id, limit);
        auditService.log(UUID.fromString(auth.getName()), AuditAction.DAILY_LIMIT_SET,
                "Account", id, limit != null ? limit.toString() : "removed");
        return toResponse(account);
    }

    private void verifyOwnership(Account account, Authentication auth) {
        if (!account.getOwnerId().toString().equals(auth.getName())) {
            throw new AccessDeniedException("Access denied");
        }
    }

    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getOwnerId(),
                account.getBalance(),
                account.getCurrency(),
                account.getStatus().name(),
                account.getCreatedAt(),
                account.getCardNetwork(),
                account.getCardTier(),
                account.getCardNumber(),
                account.getCardType(),
                account.getDailyLimit(),
                account.getExpiryDate(),
                account.getHolderName()
        );
    }
}

package com.example.Banking.account.controller;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/accounts", produces = MediaType.APPLICATION_JSON_VALUE)
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
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
        var account = accountService.create(auth.getName(), req.currency(), req.initialBalance());
        return new CreateAccountResponse(account.getId().toString());
    }

    @PostMapping("/{id}/deposit")
    public AccountResponse deposit(@PathVariable("id") UUID id,
                                   @RequestBody @Valid DepositRequest req,
                                   Authentication auth) {
        verifyOwnership(accountService.getById(id), auth);
        var account = accountService.deposit(id, req.currency(), req.amount());
        return toResponse(account);
    }

    @PostMapping("/{id}/withdraw")
    public AccountResponse withdraw(@PathVariable("id") UUID id,
                                    @RequestBody @Valid WithdrawRequest req,
                                    Authentication auth) {
        verifyOwnership(accountService.getById(id), auth);
        var account = accountService.withdraw(id, req.currency(), req.amount());
        return toResponse(account);
    }

    @PostMapping("/{id}/close")
    public AccountResponse close(@PathVariable("id") UUID id, Authentication auth) {
        verifyOwnership(accountService.getById(id), auth);
        var account = accountService.close(id);
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
                account.getCreatedAt()
        );
    }
}

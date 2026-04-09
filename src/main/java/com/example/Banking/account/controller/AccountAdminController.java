package com.example.Banking.account.controller;

import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.config.AccountNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/admin/accounts", produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasRole('ADMIN')")
public class AccountAdminController {

    private final AccountRepository accountRepository;

    public AccountAdminController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping
    public Page<AccountResponse> listAll(@PageableDefault(size = 20) Pageable pageable) {
        return accountRepository.findAll(pageable)
                .map(a -> new AccountResponse(
                        a.getId(),
                        a.getOwnerId(),
                        a.getBalance(),
                        a.getCurrency(),
                        a.getStatus().name(),
                        a.getCreatedAt()
                ));
    }

    @GetMapping("/{id}")
    public AccountResponse getById(@PathVariable UUID id) {
        var account = accountRepository.findById(id)
                .orElseThrow(() -> new AccountNotFoundException(id));
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

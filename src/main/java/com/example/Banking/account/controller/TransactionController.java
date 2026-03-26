package com.example.Banking.account.controller;

import com.example.Banking.account.repository.AccountTransactionRepository;
import com.example.Banking.account.service.AccountService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(path = "/api/accounts", produces = MediaType.APPLICATION_JSON_VALUE)
public class TransactionController {

    private final AccountTransactionRepository txRepo;
    private final AccountService accountService;

    public TransactionController(AccountTransactionRepository txRepo, AccountService accountService) {
        this.txRepo = txRepo;
        this.accountService = accountService;
    }

    @GetMapping("/{id}/transactions")
    public Page<TransactionResponse> getTransactions(
            @PathVariable("id") UUID id,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth
    ) {
        var account = accountService.getById(id);

        if (!account.getOwnerId().toString().equals(auth.getName())) {
            throw new AccessDeniedException("Access denied");
        }

        return txRepo.findByAccountIdOrderByCreatedAtDesc(id, pageable)
                .map(e -> new TransactionResponse(
                        e.getId(),
                        e.getType(),
                        e.getCurrency(),
                        e.getAmount(),
                        e.getCreatedAt()
                ));
    }
}

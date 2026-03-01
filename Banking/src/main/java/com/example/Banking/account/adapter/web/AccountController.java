package com.example.Banking.account.adapter.web;

import com.example.Banking.account.adapter.persistence.AccountJpaEntity;
import com.example.Banking.account.adapter.persistence.AccountJpaRepository;
import com.example.Banking.common.ids.AccountId;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/accounts", produces = MediaType.APPLICATION_JSON_VALUE)
public class AccountController {

    private final AccountJpaRepository accountRepository;

    public AccountController(AccountJpaRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping("/{id}")
    public AccountResponse getById(@PathVariable("id") String id) {
        var accountId = AccountId.parse(id);

        AccountJpaEntity entity = accountRepository.findById(accountId.value())
                .orElseThrow(() -> new AccountNotFoundException(accountId.value()));

        return new AccountResponse(
                entity.getId(),
                entity.getOwnerId(),
                entity.getBalance(),
                entity.getCurrency(),
                entity.getCreatedAt()
        );
    }
}
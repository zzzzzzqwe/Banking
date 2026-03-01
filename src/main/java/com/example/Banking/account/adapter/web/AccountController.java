package com.example.Banking.account.adapter.web;

import com.example.Banking.account.adapter.persistence.AccountJpaEntity;
import com.example.Banking.account.adapter.persistence.AccountJpaRepository;
import com.example.Banking.common.ids.AccountId;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateAccountResponse create(@RequestBody @Valid CreateAccountRequest req) {
        UUID id = UUID.randomUUID();
        UUID ownerId = UUID.fromString(req.ownerId());

        if (req.initialBalance().signum() < 0) {
            throw new IllegalArgumentException("initialBalance must be >= 0");
        }

        AccountJpaEntity entity = new AccountJpaEntity(
                id,
                ownerId,
                req.initialBalance(),
                req.currency(),
                LocalDateTime.now()
        );

        accountRepository.save(entity);
        return new CreateAccountResponse(id.toString());
    }
}
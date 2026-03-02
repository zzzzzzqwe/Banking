package com.example.Banking.account.adapter.web;

import com.example.Banking.account.adapter.persistence.AccountJpaEntity;
import com.example.Banking.account.adapter.persistence.AccountJpaRepository;
import com.example.Banking.common.ids.AccountId;
import com.example.Banking.config.InsufficientFundsException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
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

    @PostMapping("/{id}/deposit")
    @Transactional
    public AccountResponse deposit(
            @PathVariable("id") String id,
            @RequestBody @Valid DepositRequest req
    ) {
        var accountId = AccountId.parse(id);

        AccountJpaEntity entity = accountRepository.findById(accountId.value())
                .orElseThrow(() -> new AccountNotFoundException(accountId.value()));

        if (!entity.getCurrency().equals(req.currency())) {
            throw new IllegalArgumentException(
                    "Currency mismatch: account=" + entity.getCurrency() + ", request=" + req.currency()
            );
        }

        entity.setBalance(entity.getBalance().add(req.amount()));
        accountRepository.save(entity);

        return new AccountResponse(
                entity.getId(),
                entity.getOwnerId(),
                entity.getBalance(),
                entity.getCurrency(),
                entity.getCreatedAt()
        );
    }

    @PostMapping("/{id}/withdraw")
    @Transactional
    public AccountResponse withdraw(
            @PathVariable("id") String id,
            @RequestBody @Valid WithdrawRequest req
    ) {
        var accountId = AccountId.parse(id);

        var entity = accountRepository.findById(accountId.value())
                .orElseThrow(() -> new AccountNotFoundException(accountId.value()));

        if (!entity.getCurrency().equals(req.currency())) {
            throw new IllegalArgumentException("currency mismatch: account=" + entity.getCurrency() + ", request=" + req.currency());
        }

        if (req.amount().signum() <= 0) {
            throw new IllegalArgumentException("amount must be > 0");
        }

        var newBalance = entity.getBalance().subtract(req.amount());
        if (newBalance.signum() < 0) {
            throw new InsufficientFundsException("insufficient funds: balance=" + entity.getBalance() + ", withdraw=" + req.amount());
        }

        entity.setBalance(newBalance);
        accountRepository.save(entity);

        return new AccountResponse(
                entity.getId(),
                entity.getOwnerId(),
                entity.getBalance(),
                entity.getCurrency(),
                entity.getCreatedAt()
        );
    }
}
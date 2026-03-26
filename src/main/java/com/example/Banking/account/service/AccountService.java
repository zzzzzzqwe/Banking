package com.example.Banking.account.service;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.model.AccountStatus;
import com.example.Banking.account.model.AccountTransaction;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.account.repository.AccountTransactionRepository;
import com.example.Banking.config.AccountNotFoundException;
import com.example.Banking.config.InsufficientFundsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepo;
    private final AccountTransactionRepository txRepo;

    public AccountService(AccountRepository accountRepo, AccountTransactionRepository txRepo) {
        this.accountRepo = accountRepo;
        this.txRepo = txRepo;
    }

    public Account create(String ownerId, String currency, BigDecimal initialBalance) {
        if (initialBalance.signum() < 0) {
            throw new IllegalArgumentException("initialBalance must be >= 0");
        }

        var account = new Account(
                UUID.randomUUID(),
                UUID.fromString(ownerId),
                initialBalance.setScale(2, RoundingMode.HALF_UP),
                currency,
                AccountStatus.ACTIVE,
                LocalDateTime.now()
        );
        return accountRepo.save(account);
    }

    public Account getById(UUID id) {
        return accountRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException(id));
    }

    @Transactional
    public Account deposit(UUID id, String currency, BigDecimal amount) {
        var account = accountRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException(id));

        requireActive(account);

        if (!account.getCurrency().equals(currency)) {
            throw new IllegalArgumentException(
                    "Currency mismatch: account=" + account.getCurrency() + ", request=" + currency);
        }

        account.setBalance(account.getBalance().add(amount).setScale(2, RoundingMode.HALF_UP));
        accountRepo.save(account);
        saveTransaction(id, "DEPOSIT", currency, amount);
        return account;
    }

    @Transactional
    public Account withdraw(UUID id, String currency, BigDecimal amount) {
        var account = accountRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException(id));

        requireActive(account);

        if (!account.getCurrency().equals(currency)) {
            throw new IllegalArgumentException(
                    "Currency mismatch: account=" + account.getCurrency() + ", request=" + currency);
        }

        if (amount.signum() <= 0) {
            throw new IllegalArgumentException("amount must be > 0");
        }

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                    "insufficient funds: balance=" + account.getBalance() + ", withdraw=" + amount);
        }

        account.setBalance(account.getBalance().subtract(amount).setScale(2, RoundingMode.HALF_UP));
        accountRepo.save(account);
        saveTransaction(id, "WITHDRAW", currency, amount);
        return account;
    }

    public List<Account> findByOwnerId(UUID ownerId) {
        return accountRepo.findByOwnerId(ownerId);
    }

    @Transactional
    public Account close(UUID id) {
        var account = accountRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException(id));

        requireActive(account);

        if (account.getBalance().signum() != 0) {
            throw new IllegalArgumentException("Cannot close account with non-zero balance: " + account.getBalance());
        }

        account.setStatus(AccountStatus.CLOSED);
        return accountRepo.save(account);
    }

    private void requireActive(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("Account is closed");
        }
    }

    private void saveTransaction(UUID accountId, String type, String currency, BigDecimal amount) {
        txRepo.save(new AccountTransaction(
                UUID.randomUUID(), accountId, type, currency, amount, Instant.now()
        ));
    }
}

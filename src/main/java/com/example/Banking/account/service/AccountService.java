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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.TreeMap;
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
        return create(ownerId, currency, initialBalance, null, null);
    }

    public Account create(String ownerId, String currency, BigDecimal initialBalance, String cardNetwork, String cardTier) {
        if (initialBalance.signum() < 0) {
            throw new IllegalArgumentException("initialBalance must be >= 0");
        }

        var account = new Account(
                UUID.randomUUID(),
                UUID.fromString(ownerId),
                initialBalance.setScale(2, RoundingMode.HALF_UP),
                currency,
                AccountStatus.ACTIVE,
                LocalDateTime.now(),
                cardNetwork,
                cardTier
        );
        return accountRepo.save(account);
    }

    public Account getById(UUID id) {
        return accountRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException(id));
    }

    @Transactional
    public Account deposit(UUID id, String currency, BigDecimal amount) {
        return deposit(id, currency, amount, null);
    }

    @Transactional
    public Account deposit(UUID id, String currency, BigDecimal amount, String category) {
        var account = accountRepo.findById(id)
                .orElseThrow(() -> new AccountNotFoundException(id));

        requireActive(account);

        if (!account.getCurrency().equals(currency)) {
            throw new IllegalArgumentException(
                    "Currency mismatch: account=" + account.getCurrency() + ", request=" + currency);
        }

        account.setBalance(account.getBalance().add(amount).setScale(2, RoundingMode.HALF_UP));
        accountRepo.save(account);
        saveTransaction(id, "DEPOSIT", currency, amount, category);
        return account;
    }

    @Transactional
    public Account withdraw(UUID id, String currency, BigDecimal amount) {
        return withdraw(id, currency, amount, null);
    }

    @Transactional
    public Account withdraw(UUID id, String currency, BigDecimal amount, String category) {
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
        saveTransaction(id, "WITHDRAW", currency, amount, category);
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

    public record DailyBalance(String date, BigDecimal balance) {}

    public List<AccountTransaction> getTransactionsForExport(UUID accountId, Instant from, Instant to) {
        return txRepo.findByAccountIdAndCreatedAtBetweenOrderByCreatedAtAsc(accountId, from, to);
    }

    public List<DailyBalance> getBalanceHistory(UUID accountId, int days) {
        var account = accountRepo.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(accountId));

        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        var txs = txRepo.findByAccountIdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(accountId, since);

        // Нетто-дельта за каждый день (UTC)
        TreeMap<String, BigDecimal> dailyDelta = new TreeMap<>();
        for (var tx : txs) {
            String day = tx.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate().toString();
            String t = tx.getType();
            BigDecimal delta = ("DEPOSIT".equals(t) || "EXCHANGE_IN".equals(t)) ? tx.getAmount() : tx.getAmount().negate();
            dailyDelta.merge(day, delta, BigDecimal::add);
        }

        // Баланс на начало окна = текущий баланс − сумма всех дельт за период
        BigDecimal sumOfDeltas = dailyDelta.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal running = account.getBalance().subtract(sumOfDeltas).setScale(2, RoundingMode.HALF_UP);

        List<DailyBalance> result = new ArrayList<>();
        LocalDate startDate = LocalDate.now(ZoneOffset.UTC).minusDays(days);
        LocalDate endDate   = LocalDate.now(ZoneOffset.UTC);

        for (LocalDate d = startDate; !d.isAfter(endDate); d = d.plusDays(1)) {
            String key = d.toString();
            running = running.add(dailyDelta.getOrDefault(key, BigDecimal.ZERO))
                             .setScale(2, RoundingMode.HALF_UP);
            result.add(new DailyBalance(key, running));
        }
        return result;
    }

    private void requireActive(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("Account is closed");
        }
    }

    public void saveTransaction(UUID accountId, String type, String currency, BigDecimal amount, String category) {
        txRepo.save(new AccountTransaction(
                UUID.randomUUID(), accountId, type, currency, amount, Instant.now(), category
        ));
    }
}

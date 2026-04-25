package com.example.Banking.account.service;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.model.AccountStatus;
import com.example.Banking.account.model.AccountTransaction;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.account.repository.AccountTransactionRepository;
import com.example.Banking.config.AccountNotFoundException;
import com.example.Banking.config.InsufficientFundsException;
import com.example.Banking.user.repository.UserRepository;
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
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AccountService {

    private final AccountRepository accountRepo;
    private final AccountTransactionRepository txRepo;
    private final UserRepository userRepo;

    public AccountService(AccountRepository accountRepo,
                          AccountTransactionRepository txRepo,
                          UserRepository userRepo) {
        this.accountRepo = accountRepo;
        this.txRepo = txRepo;
        this.userRepo = userRepo;
    }

    public Account create(String ownerId, String currency, BigDecimal initialBalance) {
        return create(ownerId, currency, initialBalance, null, null, null);
    }

    public Account create(String ownerId, String currency, BigDecimal initialBalance, String cardNetwork, String cardTier) {
        return create(ownerId, currency, initialBalance, cardNetwork, cardTier, null);
    }

    @Transactional
    public Account create(String ownerId, String currency, BigDecimal initialBalance, String cardNetwork, String cardTier, String cardType) {
        if (initialBalance.signum() < 0) {
            throw new IllegalArgumentException("initialBalance must be >= 0");
        }

        UUID owner = UUID.fromString(ownerId);
        var account = new Account(
                UUID.randomUUID(),
                owner,
                initialBalance.setScale(2, RoundingMode.HALF_UP),
                currency,
                AccountStatus.ACTIVE,
                LocalDateTime.now(),
                cardNetwork,
                cardTier
        );
        account.setCardNumber(generateCardNumber(cardNetwork));
        account.setCardType(cardType == null ? "PHYSICAL" : cardType);
        account.setExpiryDate(LocalDate.now().plusYears(4));
        account.setHolderName(userRepo.findById(owner)
                .map(u -> (u.getFirstName() + " " + u.getLastName()).toUpperCase())
                .orElse("CARDHOLDER"));
        return accountRepo.save(account);
    }

    private String generateCardNumber(String network) {
        String prefix;
        if ("VISA".equalsIgnoreCase(network)) {
            prefix = "4";
        } else if ("MASTERCARD".equalsIgnoreCase(network)) {
            prefix = "5" + ThreadLocalRandom.current().nextInt(1, 6);
        } else {
            prefix = "6";
        }

        StringBuilder sb = new StringBuilder(prefix);
        ThreadLocalRandom rng = ThreadLocalRandom.current();
        while (sb.length() < 15) {
            sb.append(rng.nextInt(10));
        }

        int sum = 0;
        for (int i = 0; i < 15; i++) {
            int d = sb.charAt(i) - '0';
            if (i % 2 == 0) {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
        }
        int check = (10 - (sum % 10)) % 10;
        sb.append(check);

        String raw = sb.toString();
        return raw.substring(0, 4) + " " + raw.substring(4, 8) + " "
             + raw.substring(8, 12) + " " + raw.substring(12, 16);
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

        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new IllegalArgumentException("Card is already closed");
        }

        if (account.getBalance().signum() != 0) {
            throw new IllegalArgumentException("Cannot close card with non-zero balance: " + account.getBalance());
        }

        account.setStatus(AccountStatus.CLOSED);
        return accountRepo.save(account);
    }

    @Transactional
    public Account block(UUID id) {
        var account = accountRepo.findById(id).orElseThrow(() -> new AccountNotFoundException(id));
        if (account.getStatus() == AccountStatus.CLOSED) throw new IllegalArgumentException("Card is closed");
        account.setStatus(AccountStatus.BLOCKED);
        return accountRepo.save(account);
    }

    @Transactional
    public Account unblock(UUID id) {
        var account = accountRepo.findById(id).orElseThrow(() -> new AccountNotFoundException(id));
        if (account.getStatus() != AccountStatus.BLOCKED) throw new IllegalArgumentException("Card is not blocked");
        account.setStatus(AccountStatus.ACTIVE);
        return accountRepo.save(account);
    }

    @Transactional
    public Account setDailyLimit(UUID id, BigDecimal limit) {
        var account = accountRepo.findById(id).orElseThrow(() -> new AccountNotFoundException(id));
        if (limit != null && limit.signum() < 0) throw new IllegalArgumentException("Limit must be >= 0");
        account.setDailyLimit(limit);
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

        TreeMap<String, BigDecimal> dailyDelta = new TreeMap<>();
        for (var tx : txs) {
            String day = tx.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate().toString();
            String t = tx.getType();
            BigDecimal delta = ("DEPOSIT".equals(t) || "EXCHANGE_IN".equals(t)) ? tx.getAmount() : tx.getAmount().negate();
            dailyDelta.merge(day, delta, BigDecimal::add);
        }

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
            throw new IllegalArgumentException("Card is not active (status=" + account.getStatus() + ")");
        }
    }

    public void saveTransaction(UUID accountId, String type, String currency, BigDecimal amount, String category) {
        txRepo.save(new AccountTransaction(
                UUID.randomUUID(), accountId, type, currency, amount, Instant.now(), category
        ));
    }
}

package com.example.Banking.currency;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.model.AccountStatus;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.account.service.AccountService;
import com.example.Banking.config.AccountNotFoundException;
import com.example.Banking.config.InsufficientFundsException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Service
public class CurrencyExchangeService {

    private final AccountRepository accountRepo;
    private final AccountService accountService;
    private final ExchangeRateService rateService;
    private final CurrencyExchangeRepository exchangeRepo;

    public CurrencyExchangeService(AccountRepository accountRepo,
                                   AccountService accountService,
                                   ExchangeRateService rateService,
                                   CurrencyExchangeRepository exchangeRepo) {
        this.accountRepo = accountRepo;
        this.accountService = accountService;
        this.rateService = rateService;
        this.exchangeRepo = exchangeRepo;
    }

    @Transactional
    public ExchangeResponse exchange(String userId, UUID fromAccountId, UUID toAccountId, BigDecimal amount) {
        UUID uid = UUID.fromString(userId);

        Account from = accountRepo.findById(fromAccountId)
                .orElseThrow(() -> new AccountNotFoundException(fromAccountId));
        Account to = accountRepo.findById(toAccountId)
                .orElseThrow(() -> new AccountNotFoundException(toAccountId));

        if (!from.getOwnerId().equals(uid)) {
            throw new AccessDeniedException("Source account does not belong to caller");
        }
        if (!to.getOwnerId().equals(uid)) {
            throw new AccessDeniedException("Destination account does not belong to caller");
        }

        if (from.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("Source account is not active");
        }
        if (to.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("Destination account is not active");
        }

        if (from.getCurrency().equals(to.getCurrency())) {
            throw new IllegalArgumentException("Cannot exchange between accounts with the same currency");
        }

        if (amount.signum() <= 0) {
            throw new IllegalArgumentException("Amount must be > 0");
        }

        if (from.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                    "Insufficient funds: balance=" + from.getBalance() + ", exchange=" + amount);
        }

        BigDecimal rate = rateService.getRate(from.getCurrency(), to.getCurrency());
        BigDecimal toAmount = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);

        // Update balances
        from.setBalance(from.getBalance().subtract(amount).setScale(2, RoundingMode.HALF_UP));
        to.setBalance(to.getBalance().add(toAmount).setScale(2, RoundingMode.HALF_UP));
        accountRepo.save(from);
        accountRepo.save(to);

        // Record transactions
        accountService.saveTransaction(fromAccountId, "EXCHANGE_OUT", from.getCurrency(), amount, "EXCHANGE");
        accountService.saveTransaction(toAccountId, "EXCHANGE_IN", to.getCurrency(), toAmount, "EXCHANGE");

        // Record exchange
        Instant now = Instant.now();
        UUID exchangeId = UUID.randomUUID();
        exchangeRepo.save(new CurrencyExchange(
                exchangeId, uid, fromAccountId, toAccountId,
                amount, toAmount, from.getCurrency(), to.getCurrency(),
                rate, now
        ));

        return new ExchangeResponse(exchangeId, amount, from.getCurrency(), toAmount, to.getCurrency(), rate, now);
    }

    public Page<CurrencyExchange> getHistory(String userId, Pageable pageable) {
        return exchangeRepo.findByUserIdOrderByCreatedAtDesc(UUID.fromString(userId), pageable);
    }
}

package com.example.Banking.transaction.service;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.model.AccountStatus;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.currency.ExchangeRateService;
import com.example.Banking.notification.event.TransferCompletedEvent;
import com.example.Banking.transaction.model.IdempotencyRecord;
import com.example.Banking.transaction.model.Transfer;
import com.example.Banking.transaction.repository.IdempotencyRepository;
import com.example.Banking.transaction.repository.TransferRepository;
import com.example.Banking.user.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Service
public class TransferService {

    private final AccountRepository accountRepo;
    private final TransferRepository transferRepo;
    private final IdempotencyRepository idempotencyRepo;
    private final UserRepository userRepo;
    private final ExchangeRateService exchangeRateService;
    private final ApplicationEventPublisher eventPublisher;

    public TransferService(AccountRepository accountRepo,
                           TransferRepository transferRepo,
                           IdempotencyRepository idempotencyRepo,
                           UserRepository userRepo,
                           ExchangeRateService exchangeRateService,
                           ApplicationEventPublisher eventPublisher) {
        this.accountRepo = accountRepo;
        this.transferRepo = transferRepo;
        this.idempotencyRepo = idempotencyRepo;
        this.userRepo = userRepo;
        this.exchangeRateService = exchangeRateService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public UUID transfer(String callerId, String fromAccountId, String toAccountId,
                         String currency, String amount, String idempotencyKey) {
        // 1) idempotency check
        var existing = idempotencyRepo.findByIdemKey(idempotencyKey);
        if (existing.isPresent()) {
            return existing.get().getTransactionId();
        }

        // 2) load accounts
        UUID fromId = UUID.fromString(fromAccountId);

        Account from = accountRepo.findById(fromId)
                .orElseThrow(() -> new IllegalArgumentException("from account not found"));

        Account to = resolveAccount(toAccountId);
        UUID toId = to.getId();

        // 3) ownership check — caller must own the source account
        if (!from.getOwnerId().toString().equals(callerId)) {
            throw new AccessDeniedException("Account does not belong to the current user");
        }

        if (from.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("from account is closed");
        }
        if (to.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("to account is closed");
        }

        // 4) parse amount
        BigDecimal transferAmount = new BigDecimal(amount).setScale(2, RoundingMode.HALF_UP);
        if (transferAmount.signum() <= 0) {
            throw new IllegalArgumentException("amount must be > 0");
        }

        // 5) debit / credit with optional currency conversion
        if (from.getBalance().compareTo(transferAmount) < 0) {
            throw new IllegalArgumentException("insufficient funds");
        }

        BigDecimal creditAmount;
        BigDecimal appliedRate;

        if (from.getCurrency().equalsIgnoreCase(to.getCurrency())) {
            creditAmount = transferAmount;
            appliedRate  = null;
        } else {
            appliedRate  = exchangeRateService.getRate(from.getCurrency(), to.getCurrency());
            creditAmount = transferAmount.multiply(appliedRate).setScale(2, RoundingMode.HALF_UP);
        }

        from.setBalance(from.getBalance().subtract(transferAmount).setScale(2, RoundingMode.HALF_UP));
        to.setBalance(to.getBalance().add(creditAmount).setScale(2, RoundingMode.HALF_UP));

        accountRepo.save(from);
        accountRepo.save(to);

        // 6) save transfer record
        UUID txId = UUID.randomUUID();
        transferRepo.save(new Transfer(txId, fromId, toId,
                transferAmount, from.getCurrency(),
                creditAmount, to.getCurrency(),
                appliedRate, Instant.now()));

        // 7) store idempotency
        idempotencyRepo.save(new IdempotencyRecord(idempotencyKey, txId, Instant.now()));

        // 8) publish event (best-effort — lookup emails)
        try {
            var senderOpt    = userRepo.findById(from.getOwnerId());
            var recipientOpt = userRepo.findById(to.getOwnerId());
            if (senderOpt.isPresent() && recipientOpt.isPresent()) {
                eventPublisher.publishEvent(new TransferCompletedEvent(
                        senderOpt.get().getEmail(),
                        recipientOpt.get().getEmail(),
                        transferAmount,
                        currency,
                        txId
                ));
            }
        } catch (Exception e) {
            // don't fail the transfer if event publishing fails
        }

        return txId;
    }

    private Account resolveAccount(String idOrCardNumber) {
        try {
            UUID uuid = UUID.fromString(idOrCardNumber);
            return accountRepo.findById(uuid)
                    .orElseThrow(() -> new IllegalArgumentException("Recipient account not found"));
        } catch (IllegalArgumentException e) {
            String normalized = idOrCardNumber.replaceAll("\\s+", " ").trim();
            return accountRepo.findByCardNumber(normalized)
                    .orElseThrow(() -> new IllegalArgumentException("Card number not found: " + idOrCardNumber));
        }
    }
}

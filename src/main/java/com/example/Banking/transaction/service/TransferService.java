package com.example.Banking.transaction.service;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.model.AccountStatus;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.transaction.model.IdempotencyRecord;
import com.example.Banking.transaction.model.Transfer;
import com.example.Banking.transaction.repository.IdempotencyRepository;
import com.example.Banking.transaction.repository.TransferRepository;
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

    public TransferService(AccountRepository accountRepo,
                           TransferRepository transferRepo,
                           IdempotencyRepository idempotencyRepo) {
        this.accountRepo = accountRepo;
        this.transferRepo = transferRepo;
        this.idempotencyRepo = idempotencyRepo;
    }

    @Transactional
    public UUID transfer(String fromAccountId, String toAccountId, String currency, String amount, String idempotencyKey) {
        // 1) idempotency check
        var existing = idempotencyRepo.findByIdemKey(idempotencyKey);
        if (existing.isPresent()) {
            return existing.get().getTransactionId();
        }

        // 2) load accounts
        UUID fromId = UUID.fromString(fromAccountId);
        UUID toId = UUID.fromString(toAccountId);

        Account from = accountRepo.findById(fromId)
                .orElseThrow(() -> new IllegalArgumentException("from account not found"));
        Account to = accountRepo.findById(toId)
                .orElseThrow(() -> new IllegalArgumentException("to account not found"));

        if (from.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("from account is closed");
        }
        if (to.getStatus() != AccountStatus.ACTIVE) {
            throw new IllegalArgumentException("to account is closed");
        }

        // 3) parse amount
        BigDecimal transferAmount = new BigDecimal(amount).setScale(2, RoundingMode.HALF_UP);
        if (transferAmount.signum() <= 0) {
            throw new IllegalArgumentException("amount must be > 0");
        }

        // 4) debit / credit
        if (from.getBalance().compareTo(transferAmount) < 0) {
            throw new IllegalArgumentException("insufficient funds");
        }

        from.setBalance(from.getBalance().subtract(transferAmount));
        to.setBalance(to.getBalance().add(transferAmount));

        accountRepo.save(from);
        accountRepo.save(to);

        // 5) save transfer record
        UUID txId = UUID.randomUUID();
        transferRepo.save(new Transfer(txId, fromId, toId, transferAmount, currency, Instant.now()));

        // 6) store idempotency
        idempotencyRepo.save(new IdempotencyRecord(idempotencyKey, txId, Instant.now()));

        return txId;
    }
}

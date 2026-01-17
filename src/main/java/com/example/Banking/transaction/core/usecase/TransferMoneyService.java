package com.example.Banking.transaction.core.usecase;

import com.example.Banking.account.core.port.out.AccountRepositoryPort;
import com.example.Banking.common.ids.AccountId;
import com.example.Banking.common.ids.IdempotencyKey;
import com.example.Banking.common.ids.TransactionId;
import com.example.Banking.common.money.Money;
import com.example.Banking.transaction.core.port.in.TransferMoneyUseCase;
import com.example.Banking.transaction.core.port.out.IdempotencyPort;
import com.example.Banking.transaction.core.port.out.TransactionRepositoryPort;

import java.math.BigDecimal;
import java.util.UUID;

public class TransferMoneyService implements TransferMoneyUseCase {

    private final AccountRepositoryPort accounts;
    private final TransactionRepositoryPort txRepo;
    private final IdempotencyPort idempotency;

    public TransferMoneyService(AccountRepositoryPort accounts,
                                TransactionRepositoryPort txRepo,
                                IdempotencyPort idempotency) {
        this.accounts = accounts;
        this.txRepo = txRepo;
        this.idempotency = idempotency;
    }

    @Override
    public TransactionId transfer(TransferCommand cmd, IdempotencyKey key) {
        // 1) идемпотентность: если уже было — возвращаем тот же txId
        var existing = idempotency.findExisting(key);
        if (existing.isPresent()) return existing.get();

        // 2) загрузка аккаунтов
        var fromId = new AccountId(UUID.fromString(cmd.fromAccountId()));
        var toId   = new AccountId(UUID.fromString(cmd.toAccountId()));

        var from = accounts.findById(fromId).orElseThrow(() -> new IllegalArgumentException("from account not found"));
        var to = accounts.findById(toId).orElseThrow(() -> new IllegalArgumentException("to account not found"));

        // 3) деньги
        Money amount = Money.of(cmd.currency(), new BigDecimal(cmd.amount()));

        // 4) бизнес-операция
        from.debit(amount);
        to.credit(amount);

        // 5) сохранить
        accounts.save(from);
        accounts.save(to);

        var txId = txRepo.nextId();
        txRepo.saveTransfer(txId, cmd.fromAccountId(), cmd.toAccountId(), cmd.currency(), cmd.amount());

        // 6) зафиксировать идемпотентность
        idempotency.storeSuccess(key, txId);

        return txId;
    }
}

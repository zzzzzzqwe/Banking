package com.example.Banking.transaction.core.port.in;

import com.example.Banking.common.ids.IdempotencyKey;
import com.example.Banking.common.ids.TransactionId;

public interface TransferMoneyUseCase {
    TransactionId transfer(TransferCommand cmd, IdempotencyKey key);

    record TransferCommand(
            String fromAccountId,
            String toAccountId,
            String currency,
            String amount
    ) {}
}

package com.example.Banking.transaction.core.port.out;

import com.example.Banking.common.ids.TransactionId;

public interface TransactionRepositoryPort {
    TransactionId nextId();
    void saveTransfer(TransactionId id, String fromAccountId, String toAccountId, String currency, String amount);
}
package com.example.Banking.transaction.core.port.out;

import com.example.Banking.common.ids.IdempotencyKey;
import com.example.Banking.common.ids.TransactionId;

import java.util.Optional;

public interface IdempotencyPort {
    Optional<TransactionId> findExisting(IdempotencyKey key);
    void storeSuccess(IdempotencyKey key, TransactionId txId);
}
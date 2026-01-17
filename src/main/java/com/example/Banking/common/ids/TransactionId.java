package com.example.Banking.common.ids;

import java.util.Objects;
import java.util.UUID;

public record TransactionId(UUID value) {
    public TransactionId {
        Objects.requireNonNull(value, "TransactionId value must not be null");
    }

    public static TransactionId of(UUID value) {
        return new TransactionId(value);
    }

    public static TransactionId newId() {
        return new TransactionId(UUID.randomUUID());
    }

    public static TransactionId parse(String raw) {
        Objects.requireNonNull(raw, "TransactionId raw must not be null");
        return new TransactionId(UUID.fromString(raw));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
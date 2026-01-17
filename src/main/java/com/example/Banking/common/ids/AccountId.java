package com.example.Banking.common.ids;

import java.util.Objects;
import java.util.UUID;

public record AccountId(UUID value) {
    public AccountId {
        Objects.requireNonNull(value, "AccountId value must not be null");
    }

    public static AccountId of(UUID value) {
        return new AccountId(value);
    }

    public static AccountId newId() {
        return new AccountId(UUID.randomUUID());
    }

    public static AccountId parse(String raw) {
        Objects.requireNonNull(raw, "AccountId raw must not be null");
        return new AccountId(UUID.fromString(raw));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
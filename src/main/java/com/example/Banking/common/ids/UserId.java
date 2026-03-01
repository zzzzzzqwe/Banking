package com.example.Banking.common.ids;

import java.util.Objects;
import java.util.UUID;

public record UserId(UUID value) {
    public UserId {
        Objects.requireNonNull(value, "UserId value must not be null");
    }

    public static UserId of(UUID value) {
        return new UserId(value);
    }

    public static UserId newId() {
        return new UserId(UUID.randomUUID());
    }

    public static UserId parse(String raw) {
        Objects.requireNonNull(raw, "UserId raw must not be null");
        return new UserId(UUID.fromString(raw));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
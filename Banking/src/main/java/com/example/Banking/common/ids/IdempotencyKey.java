package com.example.Banking.common.ids;

import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

public record IdempotencyKey(String value) {

    private static final Pattern SAFE_TOKEN = Pattern.compile("^[A-Za-z0-9._:-]{8,80}$");

    public IdempotencyKey {
        Objects.requireNonNull(value, "IdempotencyKey value must not be null");
        value = value.trim();
        if (value.isEmpty()) {
            throw new IllegalArgumentException("IdempotencyKey must not be empty");
        }
        value = normalize(value);

        if (!(isUuid(value) || SAFE_TOKEN.matcher(value).matches())) {
            throw new IllegalArgumentException(
                    "IdempotencyKey must be a UUID or a safe token [A-Za-z0-9._:-]{8..80}"
            );
        }
    }

    public static IdempotencyKey of(String value) {
        return new IdempotencyKey(value);
    }

    public static IdempotencyKey fromUuid(UUID uuid) {
        Objects.requireNonNull(uuid, "uuid must not be null");
        return new IdempotencyKey(uuid.toString());
    }

    public static IdempotencyKey newUuid() {
        return new IdempotencyKey(UUID.randomUUID().toString());
    }

    public static IdempotencyKey parse(String raw) {
        return new IdempotencyKey(raw);
    }

    private static String normalize(String v) {
        if (looksLikeUuid(v)) return v.toLowerCase(Locale.ROOT);
        return v;
    }

    private static boolean looksLikeUuid(String v) {
        return v.length() == 36 && v.chars().filter(ch -> ch == '-').count() == 4;
    }

    private static boolean isUuid(String v) {
        try {
            UUID.fromString(v);
            return true;
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    @Override
    public String toString() {
        return value;
    }
}
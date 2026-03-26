package com.example.Banking.transaction.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "idempotency_keys")
public class IdempotencyRecord {

    @Id
    @Column(name = "idem_key", length = 120)
    private String idemKey;

    @Column(name = "transaction_id", nullable = false)
    private UUID transactionId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected IdempotencyRecord() {}

    public IdempotencyRecord(String idemKey, UUID transactionId, Instant createdAt) {
        this.idemKey = idemKey;
        this.transactionId = transactionId;
        this.createdAt = createdAt;
    }

    public String getIdemKey() { return idemKey; }
    public UUID getTransactionId() { return transactionId; }
    public Instant getCreatedAt() { return createdAt; }
}

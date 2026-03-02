package com.example.Banking.account.adapter.web;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transactions")
public class AccountTransactionJpaEntity {

    @Id
    private UUID id;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected AccountTransactionJpaEntity() {}

    public AccountTransactionJpaEntity(UUID id, UUID accountId, String type, String currency, BigDecimal amount, Instant createdAt) {
        this.id = id;
        this.accountId = accountId;
        this.type = type;
        this.currency = currency;
        this.amount = amount;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getAccountId() { return accountId; }
    public String getType() { return type; }
    public String getCurrency() { return currency; }
    public BigDecimal getAmount() { return amount; }
    public Instant getCreatedAt() { return createdAt; }
}
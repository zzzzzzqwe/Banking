package com.example.Banking.transaction.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transfers")
public class Transfer {

    @Id
    private UUID id;

    @Column(name = "from_account_id", nullable = false)
    private UUID fromAccountId;

    @Column(name = "to_account_id", nullable = false)
    private UUID toAccountId;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "to_credit_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal toCreditAmount;

    @Column(name = "to_currency", nullable = false, length = 3)
    private String toCurrency;

    @Column(name = "exchange_rate", precision = 19, scale = 6)
    private BigDecimal exchangeRate;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Transfer() {}

    public Transfer(UUID id, UUID fromAccountId, UUID toAccountId,
                    BigDecimal amount, String currency,
                    BigDecimal toCreditAmount, String toCurrency,
                    BigDecimal exchangeRate, Instant createdAt) {
        this.id = id;
        this.fromAccountId = fromAccountId;
        this.toAccountId = toAccountId;
        this.amount = amount;
        this.currency = currency;
        this.toCreditAmount = toCreditAmount;
        this.toCurrency = toCurrency;
        this.exchangeRate = exchangeRate;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getFromAccountId() { return fromAccountId; }
    public UUID getToAccountId() { return toAccountId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public BigDecimal getToCreditAmount() { return toCreditAmount; }
    public String getToCurrency() { return toCurrency; }
    public BigDecimal getExchangeRate() { return exchangeRate; }
    public Instant getCreatedAt() { return createdAt; }
}

package com.example.Banking.account.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(name = "balance", nullable = false, precision = 19, scale = 7)
    private BigDecimal balance;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, columnDefinition = "varchar(20) default 'ACTIVE'")
    private AccountStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "card_network", length = 20)
    private String cardNetwork;

    @Column(name = "card_tier", length = 20)
    private String cardTier;

    protected Account() {}

    public Account(UUID id, UUID ownerId, BigDecimal balance, String currency, AccountStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.balance = balance;
        this.currency = currency;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Account(UUID id, UUID ownerId, BigDecimal balance, String currency, AccountStatus status, LocalDateTime createdAt,
                   String cardNetwork, String cardTier) {
        this(id, ownerId, balance, currency, status, createdAt);
        this.cardNetwork = cardNetwork;
        this.cardTier = cardTier;
    }

    public UUID getId() { return id; }
    public UUID getOwnerId() { return ownerId; }
    public BigDecimal getBalance() { return balance; }
    public String getCurrency() { return currency; }
    public AccountStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getCardNetwork() { return cardNetwork; }
    public String getCardTier() { return cardTier; }

    public void setBalance(BigDecimal balance) { this.balance = balance; }
    public void setStatus(AccountStatus status) { this.status = status; }
}

package com.example.Banking.beneficiary.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "beneficiaries", indexes = {
        @Index(name = "idx_beneficiary_user", columnList = "user_id")
})
public class Beneficiary {

    @Id
    @Column(nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String nickname;

    @Column(name = "account_number", nullable = false, length = 64)
    private String accountNumber;

    /** Optional reference to internal account if beneficiary belongs to this bank. */
    @Column(name = "account_id")
    private UUID accountId;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "holder_name", length = 100)
    private String holderName;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "is_favorite", nullable = false)
    private boolean favorite;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    protected Beneficiary() {}

    public Beneficiary(UUID id, UUID userId, String nickname, String accountNumber, UUID accountId,
                       String bankName, String holderName, String currency, boolean favorite,
                       LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.nickname = nickname;
        this.accountNumber = accountNumber;
        this.accountId = accountId;
        this.bankName = bankName;
        this.holderName = holderName;
        this.currency = currency;
        this.favorite = favorite;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getNickname() { return nickname; }
    public String getAccountNumber() { return accountNumber; }
    public UUID getAccountId() { return accountId; }
    public String getBankName() { return bankName; }
    public String getHolderName() { return holderName; }
    public String getCurrency() { return currency; }
    public boolean isFavorite() { return favorite; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getLastUsedAt() { return lastUsedAt; }

    public void setNickname(String nickname) { this.nickname = nickname; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public void setHolderName(String holderName) { this.holderName = holderName; }
    public void setFavorite(boolean favorite) { this.favorite = favorite; }
    public void setLastUsedAt(LocalDateTime lastUsedAt) { this.lastUsedAt = lastUsedAt; }
    public void setAccountId(UUID accountId) { this.accountId = accountId; }
}

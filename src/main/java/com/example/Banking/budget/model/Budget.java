package com.example.Banking.budget.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "budgets", indexes = {
        @Index(name = "idx_budgets_user", columnList = "user_id")
})
public class Budget {

    @Id
    @Column(nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "category_id", nullable = false)
    private UUID categoryId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private BudgetPeriod period;

    @Column(name = "limit_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal limitAmount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "alert_threshold", precision = 5, scale = 2)
    private BigDecimal alertThreshold;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected Budget() {}

    public Budget(UUID id, UUID userId, UUID categoryId, BudgetPeriod period,
                  BigDecimal limitAmount, String currency, BigDecimal alertThreshold,
                  LocalDate startDate, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.categoryId = categoryId;
        this.period = period;
        this.limitAmount = limitAmount;
        this.currency = currency;
        this.alertThreshold = alertThreshold;
        this.startDate = startDate;
        this.createdAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getCategoryId() { return categoryId; }
    public BudgetPeriod getPeriod() { return period; }
    public BigDecimal getLimitAmount() { return limitAmount; }
    public String getCurrency() { return currency; }
    public BigDecimal getAlertThreshold() { return alertThreshold; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setLimitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; }
    public void setPeriod(BudgetPeriod period) { this.period = period; }
    public void setAlertThreshold(BigDecimal alertThreshold) { this.alertThreshold = alertThreshold; }
}

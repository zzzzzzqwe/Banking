package com.example.Banking.loan.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "loans")
public class Loan {

    @Id
    @Column(nullable = false)
    private UUID id;

    @Column(name = "borrower_id", nullable = false)
    private UUID borrowerId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "principal_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal principalAmount;

    @Column(name = "annual_interest_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal annualInterestRate;

    @Column(name = "term_months", nullable = false)
    private int termMonths;

    @Column(name = "monthly_payment", precision = 19, scale = 2)
    private BigDecimal monthlyPayment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LoanStatus status;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected Loan() {}

    public Loan(UUID id, UUID borrowerId, UUID accountId,
                BigDecimal principalAmount, BigDecimal annualInterestRate,
                int termMonths, LoanStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.borrowerId = borrowerId;
        this.accountId = accountId;
        this.principalAmount = principalAmount;
        this.annualInterestRate = annualInterestRate;
        this.termMonths = termMonths;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public UUID getId() { return id; }
    public UUID getBorrowerId() { return borrowerId; }
    public UUID getAccountId() { return accountId; }
    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public BigDecimal getAnnualInterestRate() { return annualInterestRate; }
    public int getTermMonths() { return termMonths; }
    public BigDecimal getMonthlyPayment() { return monthlyPayment; }
    public LoanStatus getStatus() { return status; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setStatus(LoanStatus status) { this.status = status; this.updatedAt = LocalDateTime.now(); }
    public void setMonthlyPayment(BigDecimal monthlyPayment) { this.monthlyPayment = monthlyPayment; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}

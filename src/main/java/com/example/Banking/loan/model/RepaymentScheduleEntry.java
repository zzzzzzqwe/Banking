package com.example.Banking.loan.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "repayment_schedule")
public class RepaymentScheduleEntry {

    @Id
    @Column(nullable = false)
    private UUID id;

    @Column(name = "loan_id", nullable = false)
    private UUID loanId;

    @Column(name = "installment_number", nullable = false)
    private int installmentNumber;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal principal;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal interest;

    @Column(name = "total_payment", nullable = false, precision = 19, scale = 2)
    private BigDecimal totalPayment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RepaymentStatus status;

    @Column(name = "paid_at")
    private LocalDate paidAt;

    protected RepaymentScheduleEntry() {}

    public RepaymentScheduleEntry(UUID id, UUID loanId, int installmentNumber,
                                   LocalDate dueDate, BigDecimal principal,
                                   BigDecimal interest, BigDecimal totalPayment,
                                   RepaymentStatus status, LocalDate paidAt) {
        this.id = id;
        this.loanId = loanId;
        this.installmentNumber = installmentNumber;
        this.dueDate = dueDate;
        this.principal = principal;
        this.interest = interest;
        this.totalPayment = totalPayment;
        this.status = status;
        this.paidAt = paidAt;
    }

    public UUID getId() { return id; }
    public UUID getLoanId() { return loanId; }
    public int getInstallmentNumber() { return installmentNumber; }
    public LocalDate getDueDate() { return dueDate; }
    public BigDecimal getPrincipal() { return principal; }
    public BigDecimal getInterest() { return interest; }
    public BigDecimal getTotalPayment() { return totalPayment; }
    public RepaymentStatus getStatus() { return status; }
    public LocalDate getPaidAt() { return paidAt; }

    public void setStatus(RepaymentStatus status) { this.status = status; }
    public void setPaidAt(LocalDate paidAt) { this.paidAt = paidAt; }
}

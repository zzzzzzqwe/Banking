package com.example.Banking.loan.repository;

import com.example.Banking.loan.model.RepaymentScheduleEntry;
import com.example.Banking.loan.model.RepaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RepaymentScheduleRepository extends JpaRepository<RepaymentScheduleEntry, UUID> {
    List<RepaymentScheduleEntry> findByLoanIdOrderByInstallmentNumber(UUID loanId);
    Optional<RepaymentScheduleEntry> findFirstByLoanIdAndStatusOrderByInstallmentNumber(
            UUID loanId, RepaymentStatus status);
}

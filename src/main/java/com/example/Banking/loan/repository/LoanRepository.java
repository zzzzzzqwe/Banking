package com.example.Banking.loan.repository;

import com.example.Banking.loan.model.Loan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LoanRepository extends JpaRepository<Loan, UUID> {
    List<Loan> findByBorrowerIdOrderByCreatedAtDesc(UUID borrowerId);
    Page<Loan> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

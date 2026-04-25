package com.example.Banking.budget.repository;

import com.example.Banking.budget.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    List<Budget> findByUserId(UUID userId);
    boolean existsByUserIdAndCategoryIdAndPeriod(UUID userId, UUID categoryId, com.example.Banking.budget.model.BudgetPeriod period);
}

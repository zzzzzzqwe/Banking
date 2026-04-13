package com.example.Banking.savingsgoal.repository;

import com.example.Banking.savingsgoal.model.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, UUID> {
    List<SavingsGoal> findByUserId(UUID userId);
    List<SavingsGoal> findByUserIdAndAccountId(UUID userId, UUID accountId);
}

package com.example.Banking.savingsgoal.service;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.account.service.AccountService;
import com.example.Banking.notification.event.SavingsGoalCompletedEvent;
import com.example.Banking.savingsgoal.controller.SavingsGoalResponse;
import com.example.Banking.savingsgoal.model.SavingsGoal;
import com.example.Banking.savingsgoal.repository.SavingsGoalRepository;
import com.example.Banking.user.model.User;
import com.example.Banking.user.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SavingsGoalService {

    private final SavingsGoalRepository goalRepo;
    private final AccountRepository accountRepo;
    private final AccountService accountService;
    private final UserRepository userRepo;
    private final ApplicationEventPublisher eventPublisher;

    public SavingsGoalService(SavingsGoalRepository goalRepo,
                              AccountRepository accountRepo,
                              AccountService accountService,
                              UserRepository userRepo,
                              ApplicationEventPublisher eventPublisher) {
        this.goalRepo = goalRepo;
        this.accountRepo = accountRepo;
        this.accountService = accountService;
        this.userRepo = userRepo;
        this.eventPublisher = eventPublisher;
    }

    public List<SavingsGoalResponse> listGoals(String userId) {
        return goalRepo.findByUserId(UUID.fromString(userId)).stream()
                .map(SavingsGoalResponse::from)
                .toList();
    }

    @Transactional
    public SavingsGoalResponse createGoal(String userId, UUID accountId, String name,
                                          String description, BigDecimal targetAmount) {
        Account account = accountRepo.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        if (!account.getOwnerId().equals(UUID.fromString(userId))) {
            throw new SecurityException("Access denied");
        }

        var goal = new SavingsGoal(
                UUID.randomUUID(),
                UUID.fromString(userId),
                accountId,
                name,
                description,
                targetAmount.setScale(2, RoundingMode.HALF_UP),
                account.getCurrency()
        );

        goalRepo.save(goal);
        return SavingsGoalResponse.from(goal);
    }

    @Transactional
    public SavingsGoalResponse deposit(UUID goalId, String userId, BigDecimal amount) {
        SavingsGoal goal = getAndVerifyOwnership(goalId, userId);

        if (goal.isCompleted()) {
            throw new IllegalArgumentException("Goal is already completed");
        }

        // Deduct from linked account
        accountService.withdraw(goal.getAccountId(), goal.getCurrency(), amount, "SAVINGS_GOAL");

        goal.setCurrentAmount(goal.getCurrentAmount().add(amount).setScale(2, RoundingMode.HALF_UP));

        // Check if target reached
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setCompleted(true);
            goal.setCompletedAt(LocalDateTime.now());
            publishGoalCompletedEvent(goal);
        }

        goalRepo.save(goal);
        return SavingsGoalResponse.from(goal);
    }

    @Transactional
    public SavingsGoalResponse withdraw(UUID goalId, String userId, BigDecimal amount) {
        SavingsGoal goal = getAndVerifyOwnership(goalId, userId);

        if (amount.compareTo(goal.getCurrentAmount()) > 0) {
            throw new IllegalArgumentException("Amount exceeds goal balance");
        }

        // Return money to linked account
        accountService.deposit(goal.getAccountId(), goal.getCurrency(), amount, "SAVINGS_GOAL");

        goal.setCurrentAmount(goal.getCurrentAmount().subtract(amount).setScale(2, RoundingMode.HALF_UP));

        if (goal.isCompleted() && goal.getCurrentAmount().compareTo(goal.getTargetAmount()) < 0) {
            goal.setCompleted(false);
            goal.setCompletedAt(null);
        }

        goalRepo.save(goal);
        return SavingsGoalResponse.from(goal);
    }

    @Transactional
    public void deleteGoal(UUID goalId, String userId) {
        SavingsGoal goal = getAndVerifyOwnership(goalId, userId);

        // Return remaining funds to account
        if (goal.getCurrentAmount().signum() > 0) {
            accountService.deposit(goal.getAccountId(), goal.getCurrency(),
                    goal.getCurrentAmount(), "SAVINGS_GOAL");
        }

        goalRepo.delete(goal);
    }

    private SavingsGoal getAndVerifyOwnership(UUID goalId, String userId) {
        SavingsGoal goal = goalRepo.findById(goalId)
                .orElseThrow(() -> new IllegalArgumentException("Savings goal not found"));

        if (!goal.getUserId().equals(UUID.fromString(userId))) {
            throw new SecurityException("Access denied");
        }

        return goal;
    }

    private void publishGoalCompletedEvent(SavingsGoal goal) {
        User user = userRepo.findById(goal.getUserId()).orElse(null);
        if (user != null) {
            eventPublisher.publishEvent(new SavingsGoalCompletedEvent(
                    goal.getUserId(),
                    user.getEmail(),
                    user.getFirstName(),
                    goal.getName(),
                    goal.getTargetAmount(),
                    goal.getCurrency()
            ));
        }
    }
}

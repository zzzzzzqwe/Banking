package com.example.Banking.budget.service;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.model.AccountTransaction;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.account.repository.AccountTransactionRepository;
import com.example.Banking.budget.model.Budget;
import com.example.Banking.budget.model.BudgetPeriod;
import com.example.Banking.budget.model.Category;
import com.example.Banking.budget.repository.BudgetRepository;
import com.example.Banking.budget.repository.CategoryRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepo;
    private final CategoryRepository categoryRepo;
    private final AccountRepository accountRepo;
    private final AccountTransactionRepository txRepo;

    public BudgetService(BudgetRepository budgetRepo, CategoryRepository categoryRepo,
                         AccountRepository accountRepo, AccountTransactionRepository txRepo) {
        this.budgetRepo = budgetRepo;
        this.categoryRepo = categoryRepo;
        this.accountRepo = accountRepo;
        this.txRepo = txRepo;
    }

    public List<Budget> listForUser(UUID userId) {
        return budgetRepo.findByUserId(userId);
    }

    @Transactional
    public Budget create(UUID userId, UUID categoryId, BudgetPeriod period, BigDecimal limit, String currency, BigDecimal alertThreshold) {
        var cat = categoryRepo.findById(categoryId).orElseThrow(() -> new IllegalArgumentException("Category not found"));
        if (cat.getUserId() != null && !cat.getUserId().equals(userId)) throw new AccessDeniedException("Access denied");
        if (limit == null || limit.signum() <= 0) throw new IllegalArgumentException("limit must be > 0");
        if (budgetRepo.existsByUserIdAndCategoryIdAndPeriod(userId, categoryId, period)) {
            throw new IllegalArgumentException("Budget already exists for this category and period");
        }
        var b = new Budget(UUID.randomUUID(), userId, categoryId, period,
                limit.setScale(2, RoundingMode.HALF_UP), currency, alertThreshold,
                LocalDate.now(), LocalDateTime.now());
        return budgetRepo.save(b);
    }

    @Transactional
    public Budget update(UUID id, UUID userId, BigDecimal limit, BudgetPeriod period, BigDecimal alertThreshold) {
        var b = budgetRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Budget not found"));
        if (!b.getUserId().equals(userId)) throw new AccessDeniedException("Access denied");
        if (limit != null) b.setLimitAmount(limit.setScale(2, RoundingMode.HALF_UP));
        if (period != null) b.setPeriod(period);
        if (alertThreshold != null) b.setAlertThreshold(alertThreshold);
        return budgetRepo.save(b);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        var b = budgetRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Budget not found"));
        if (!b.getUserId().equals(userId)) throw new AccessDeniedException("Access denied");
        budgetRepo.delete(b);
    }

    public BudgetProgress computeProgress(Budget budget) {
        var category = categoryRepo.findById(budget.getCategoryId()).orElse(null);
        String code = category == null ? null : category.getCode();
        Instant from = periodStart(budget.getPeriod()).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant to = Instant.now();

        Set<UUID> accountIds = new HashSet<>();
        for (Account a : accountRepo.findByOwnerId(budget.getUserId())) accountIds.add(a.getId());

        BigDecimal spent = BigDecimal.ZERO;
        for (UUID accId : accountIds) {
            List<AccountTransaction> txs = txRepo.findByAccountIdAndCreatedAtBetweenOrderByCreatedAtAsc(accId, from, to);
            for (AccountTransaction tx : txs) {
                if (code != null && code.equalsIgnoreCase(tx.getCategory()) && isExpense(tx.getType())) {
                    spent = spent.add(tx.getAmount());
                }
            }
        }
        spent = spent.setScale(2, RoundingMode.HALF_UP);
        BigDecimal remaining = budget.getLimitAmount().subtract(spent);
        BigDecimal percent = budget.getLimitAmount().signum() > 0
                ? spent.multiply(BigDecimal.valueOf(100)).divide(budget.getLimitAmount(), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        return new BudgetProgress(spent, remaining.max(BigDecimal.ZERO), percent, periodStart(budget.getPeriod()), periodEnd(budget.getPeriod()));
    }

    private boolean isExpense(String type) {
        if (type == null) return false;
        return type.contains("WITHDRAW") || type.contains("DEBIT") || type.equals("EXCHANGE_OUT") || type.startsWith("TRANSFER_OUT") || type.equals("LOAN_REPAYMENT");
    }

    private LocalDate periodStart(BudgetPeriod period) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        if (period == BudgetPeriod.WEEKLY) return today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        return today.withDayOfMonth(1);
    }

    private LocalDate periodEnd(BudgetPeriod period) {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        if (period == BudgetPeriod.WEEKLY) return today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        return today.with(TemporalAdjusters.lastDayOfMonth());
    }

    public record BudgetProgress(BigDecimal spent, BigDecimal remaining, BigDecimal percentUsed,
                                 LocalDate periodStart, LocalDate periodEnd) {}
}

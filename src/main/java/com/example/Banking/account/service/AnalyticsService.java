package com.example.Banking.account.service;

import com.example.Banking.account.model.AccountTransaction;
import com.example.Banking.account.repository.AccountTransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AnalyticsService {

    private static final Set<String> INCOME_TYPES = Set.of("DEPOSIT", "EXCHANGE_IN");

    private final AccountTransactionRepository txRepo;

    public AnalyticsService(AccountTransactionRepository txRepo) {
        this.txRepo = txRepo;
    }

    public AnalyticsResponse getAnalytics(UUID accountId, int days) {
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        var txs = txRepo.findByAccountIdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(accountId, since);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryTotals = new TreeMap<>();
        TreeMap<String, BigDecimal[]> dailyMap = new TreeMap<>(); // [income, expense]

        for (var tx : txs) {
            boolean isIncome = INCOME_TYPES.contains(tx.getType());
            BigDecimal amt = tx.getAmount();
            String day = tx.getCreatedAt().atZone(ZoneOffset.UTC).toLocalDate().toString();

            if (isIncome) {
                totalIncome = totalIncome.add(amt);
            } else {
                totalExpense = totalExpense.add(amt);
                String cat = tx.getCategory() != null ? tx.getCategory() : "OTHER";
                categoryTotals.merge(cat, amt, BigDecimal::add);
            }

            dailyMap.computeIfAbsent(day, k -> new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal[] pair = dailyMap.get(day);
            if (isIncome) {
                pair[0] = pair[0].add(amt);
            } else {
                pair[1] = pair[1].add(amt);
            }
        }

        // Category breakdown with percentages
        List<AnalyticsResponse.CategoryBreakdown> breakdown = new ArrayList<>();
        if (totalExpense.signum() > 0) {
            for (var entry : categoryTotals.entrySet()) {
                double pct = entry.getValue()
                        .divide(totalExpense, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(1, RoundingMode.HALF_UP)
                        .doubleValue();
                breakdown.add(new AnalyticsResponse.CategoryBreakdown(
                        entry.getKey(), entry.getValue().setScale(2, RoundingMode.HALF_UP), pct));
            }
        }
        breakdown.sort(Comparator.comparing(AnalyticsResponse.CategoryBreakdown::amount).reversed());

        // Daily aggregates — fill all days in range
        List<AnalyticsResponse.DailyAggregate> dailyAggregates = new ArrayList<>();
        LocalDate startDate = LocalDate.now(ZoneOffset.UTC).minusDays(days);
        LocalDate endDate = LocalDate.now(ZoneOffset.UTC);
        for (LocalDate d = startDate; !d.isAfter(endDate); d = d.plusDays(1)) {
            String key = d.toString();
            BigDecimal[] pair = dailyMap.getOrDefault(key, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            dailyAggregates.add(new AnalyticsResponse.DailyAggregate(
                    key, pair[0].setScale(2, RoundingMode.HALF_UP), pair[1].setScale(2, RoundingMode.HALF_UP)));
        }

        BigDecimal net = totalIncome.subtract(totalExpense).setScale(2, RoundingMode.HALF_UP);
        return new AnalyticsResponse(
                totalIncome.setScale(2, RoundingMode.HALF_UP),
                totalExpense.setScale(2, RoundingMode.HALF_UP),
                net, breakdown, dailyAggregates
        );
    }

    public record AnalyticsResponse(
            BigDecimal totalIncome,
            BigDecimal totalExpense,
            BigDecimal net,
            List<CategoryBreakdown> categoryBreakdown,
            List<DailyAggregate> dailyAggregates
    ) {
        public record CategoryBreakdown(String category, BigDecimal amount, double percentage) {}
        public record DailyAggregate(String date, BigDecimal income, BigDecimal expense) {}
    }
}

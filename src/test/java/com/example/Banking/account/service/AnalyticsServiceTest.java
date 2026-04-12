package com.example.Banking.account.service;

import com.example.Banking.account.model.AccountTransaction;
import com.example.Banking.account.repository.AccountTransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock AccountTransactionRepository txRepo;
    @InjectMocks AnalyticsService service;

    private final UUID accountId = UUID.randomUUID();

    private AccountTransaction tx(String type, BigDecimal amount, String category) {
        return new AccountTransaction(
                UUID.randomUUID(), accountId, type, "USD", amount, Instant.now(), category
        );
    }

    @Test
    void analytics_withMixedTransactions() {
        var txs = List.of(
                tx("DEPOSIT", new BigDecimal("500.00"), "SALARY"),
                tx("WITHDRAW", new BigDecimal("50.00"), "GROCERIES"),
                tx("WITHDRAW", new BigDecimal("30.00"), "TRANSPORT"),
                tx("EXCHANGE_IN", new BigDecimal("100.00"), "EXCHANGE"),
                tx("EXCHANGE_OUT", new BigDecimal("80.00"), "EXCHANGE")
        );

        when(txRepo.findByAccountIdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(eq(accountId), any()))
                .thenReturn(txs);

        var result = service.getAnalytics(accountId, 30);

        assertThat(result.totalIncome()).isEqualByComparingTo("600.00"); // 500 + 100
        assertThat(result.totalExpense()).isEqualByComparingTo("160.00"); // 50 + 30 + 80
        assertThat(result.net()).isEqualByComparingTo("440.00");

        assertThat(result.categoryBreakdown()).hasSize(3); // GROCERIES, TRANSPORT, EXCHANGE
        assertThat(result.categoryBreakdown().get(0).category()).isEqualTo("EXCHANGE"); // largest expense
        assertThat(result.categoryBreakdown().get(0).amount()).isEqualByComparingTo("80.00");
    }

    @Test
    void analytics_noTransactions() {
        when(txRepo.findByAccountIdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(eq(accountId), any()))
                .thenReturn(List.of());

        var result = service.getAnalytics(accountId, 30);

        assertThat(result.totalIncome()).isEqualByComparingTo("0.00");
        assertThat(result.totalExpense()).isEqualByComparingTo("0.00");
        assertThat(result.net()).isEqualByComparingTo("0.00");
        assertThat(result.categoryBreakdown()).isEmpty();
        assertThat(result.dailyAggregates()).hasSizeGreaterThan(0); // days are still filled
    }

    @Test
    void analytics_onlyDeposits() {
        var txs = List.of(
                tx("DEPOSIT", new BigDecimal("100.00"), "SALARY"),
                tx("DEPOSIT", new BigDecimal("200.00"), null)
        );

        when(txRepo.findByAccountIdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(eq(accountId), any()))
                .thenReturn(txs);

        var result = service.getAnalytics(accountId, 7);

        assertThat(result.totalIncome()).isEqualByComparingTo("300.00");
        assertThat(result.totalExpense()).isEqualByComparingTo("0.00");
        assertThat(result.net()).isEqualByComparingTo("300.00");
        assertThat(result.categoryBreakdown()).isEmpty(); // no expenses = no breakdown
    }

    @Test
    void analytics_categoryPercentages() {
        var txs = List.of(
                tx("WITHDRAW", new BigDecimal("75.00"), "GROCERIES"),
                tx("WITHDRAW", new BigDecimal("25.00"), "TRANSPORT")
        );

        when(txRepo.findByAccountIdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(eq(accountId), any()))
                .thenReturn(txs);

        var result = service.getAnalytics(accountId, 30);

        var groceries = result.categoryBreakdown().stream()
                .filter(c -> c.category().equals("GROCERIES")).findFirst().orElseThrow();
        var transport = result.categoryBreakdown().stream()
                .filter(c -> c.category().equals("TRANSPORT")).findFirst().orElseThrow();

        assertThat(groceries.percentage()).isEqualTo(75.0);
        assertThat(transport.percentage()).isEqualTo(25.0);
    }
}

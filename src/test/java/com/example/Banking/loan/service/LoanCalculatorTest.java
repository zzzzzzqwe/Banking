package com.example.Banking.loan.service;

import com.example.Banking.loan.model.RepaymentScheduleEntry;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

class LoanCalculatorTest {

    private final LoanCalculator calculator = new LoanCalculator();

    @Test
    void monthlyPayment_knownValues() {
        // $10,000 at 12% annual for 12 months
        // Monthly rate = 1%, M = 10000 * (0.01 * 1.01^12) / (1.01^12 - 1)
        BigDecimal payment = calculator.monthlyPayment(
                new BigDecimal("10000"), new BigDecimal("0.12"), 12);

        // Expected ~888.49
        assertThat(payment).isEqualByComparingTo("888.49");
    }

    @Test
    void monthlyPayment_zeroRate() {
        BigDecimal payment = calculator.monthlyPayment(
                new BigDecimal("12000"), BigDecimal.ZERO, 12);

        assertThat(payment).isEqualByComparingTo("1000.00");
    }

    @Test
    void monthlyPayment_zeroRate_unevenDivision() {
        BigDecimal payment = calculator.monthlyPayment(
                new BigDecimal("10000"), BigDecimal.ZERO, 3);

        assertThat(payment).isEqualByComparingTo("3333.33");
    }

    @Test
    void buildSchedule_correctNumberOfEntries() {
        BigDecimal monthly = calculator.monthlyPayment(
                new BigDecimal("10000"), new BigDecimal("0.12"), 12);

        List<RepaymentScheduleEntry> schedule = calculator.buildSchedule(
                UUID.randomUUID(), new BigDecimal("10000"), new BigDecimal("0.12"),
                12, LocalDate.of(2026, 1, 1), monthly);

        assertThat(schedule).hasSize(12);
    }

    @Test
    void buildSchedule_sumOfPrincipalEqualsLoanAmount() {
        BigDecimal principal = new BigDecimal("10000");
        BigDecimal monthly = calculator.monthlyPayment(principal, new BigDecimal("0.12"), 12);

        List<RepaymentScheduleEntry> schedule = calculator.buildSchedule(
                UUID.randomUUID(), principal, new BigDecimal("0.12"),
                12, LocalDate.of(2026, 1, 1), monthly);

        BigDecimal totalPrincipal = schedule.stream()
                .map(RepaymentScheduleEntry::getPrincipal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(totalPrincipal.setScale(2, RoundingMode.HALF_UP))
                .isEqualByComparingTo(principal);
    }

    @Test
    void buildSchedule_installmentNumbersSequential() {
        BigDecimal monthly = calculator.monthlyPayment(
                new BigDecimal("5000"), new BigDecimal("0.06"), 6);

        List<RepaymentScheduleEntry> schedule = calculator.buildSchedule(
                UUID.randomUUID(), new BigDecimal("5000"), new BigDecimal("0.06"),
                6, LocalDate.of(2026, 3, 1), monthly);

        for (int i = 0; i < schedule.size(); i++) {
            assertThat(schedule.get(i).getInstallmentNumber()).isEqualTo(i + 1);
        }
    }

    @Test
    void buildSchedule_dueDatesMonthly() {
        LocalDate start = LocalDate.of(2026, 1, 1);
        BigDecimal monthly = calculator.monthlyPayment(
                new BigDecimal("6000"), new BigDecimal("0.10"), 6);

        List<RepaymentScheduleEntry> schedule = calculator.buildSchedule(
                UUID.randomUUID(), new BigDecimal("6000"), new BigDecimal("0.10"),
                6, start, monthly);

        for (int i = 0; i < schedule.size(); i++) {
            assertThat(schedule.get(i).getDueDate()).isEqualTo(start.plusMonths(i + 1));
        }
    }

    @Test
    void buildSchedule_zeroRate_equalPayments() {
        BigDecimal principal = new BigDecimal("12000");
        BigDecimal monthly = calculator.monthlyPayment(principal, BigDecimal.ZERO, 12);

        List<RepaymentScheduleEntry> schedule = calculator.buildSchedule(
                UUID.randomUUID(), principal, BigDecimal.ZERO,
                12, LocalDate.of(2026, 1, 1), monthly);

        for (RepaymentScheduleEntry e : schedule) {
            assertThat(e.getInterest()).isEqualByComparingTo("0.00");
        }
    }
}

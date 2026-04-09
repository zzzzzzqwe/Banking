package com.example.Banking.loan.service;

import com.example.Banking.loan.model.RepaymentScheduleEntry;
import com.example.Banking.loan.model.RepaymentStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class LoanCalculator {

    /**
     * Аннуитетная формула: M = P × (r × (1+r)^n) / ((1+r)^n − 1)
     * где r = annualRate / 12, n = termMonths
     */
    public BigDecimal monthlyPayment(BigDecimal principal, BigDecimal annualRate, int termMonths) {
        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            return principal.divide(BigDecimal.valueOf(termMonths), 2, RoundingMode.HALF_UP);
        }
        double r = annualRate.doubleValue() / 12.0;
        double n = termMonths;
        double factor = Math.pow(1 + r, n);
        double payment = principal.doubleValue() * (r * factor) / (factor - 1);
        return BigDecimal.valueOf(payment).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Строит полное расписание платежей.
     * Последний взнос корректируется для устранения погрешности округления.
     */
    public List<RepaymentScheduleEntry> buildSchedule(UUID loanId, BigDecimal principal,
                                                       BigDecimal annualRate, int termMonths,
                                                       LocalDate startDate, BigDecimal monthlyPayment) {
        List<RepaymentScheduleEntry> schedule = new ArrayList<>();
        BigDecimal remaining = principal;
        BigDecimal r = annualRate.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO
                : annualRate.divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

        for (int i = 1; i <= termMonths; i++) {
            BigDecimal interestPart = remaining.multiply(r).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principalPart;
            BigDecimal payment;

            if (i == termMonths) {
                // Последний взнос: гасим остаток целиком
                principalPart = remaining;
                payment = principalPart.add(interestPart);
            } else {
                principalPart = monthlyPayment.subtract(interestPart);
                payment = monthlyPayment;
            }

            remaining = remaining.subtract(principalPart).setScale(2, RoundingMode.HALF_UP);

            schedule.add(new RepaymentScheduleEntry(
                    UUID.randomUUID(), loanId, i,
                    startDate.plusMonths(i),
                    principalPart, interestPart, payment,
                    RepaymentStatus.PENDING, null
            ));
        }

        return schedule;
    }
}

package com.example.Banking.account.controller;

import com.example.Banking.account.model.AccountStatus;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.account.repository.AccountTransactionRepository;
import com.example.Banking.loan.model.LoanStatus;
import com.example.Banking.loan.model.RepaymentStatus;
import com.example.Banking.loan.repository.LoanRepository;
import com.example.Banking.loan.repository.RepaymentScheduleRepository;
import com.example.Banking.user.repository.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping(path = "/api/admin/stats", produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    private final UserRepository userRepo;
    private final AccountRepository accountRepo;
    private final LoanRepository loanRepo;
    private final RepaymentScheduleRepository scheduleRepo;
    private final AccountTransactionRepository txRepo;

    public AdminStatsController(UserRepository userRepo,
                                AccountRepository accountRepo,
                                LoanRepository loanRepo,
                                RepaymentScheduleRepository scheduleRepo,
                                AccountTransactionRepository txRepo) {
        this.userRepo = userRepo;
        this.accountRepo = accountRepo;
        this.loanRepo = loanRepo;
        this.scheduleRepo = scheduleRepo;
        this.txRepo = txRepo;
    }

    @GetMapping
    public AdminStatsResponse getStats() {
        // Users
        long totalUsers   = userRepo.count();
        long activeUsers  = userRepo.countByActiveTrue();

        // Accounts
        long totalAccounts  = accountRepo.count();
        long activeAccounts = accountRepo.countByStatus(AccountStatus.ACTIVE);

        // Loans
        long totalLoans    = loanRepo.count();
        long activeLoans   = loanRepo.countByStatus(LoanStatus.ACTIVE);
        long pendingLoans  = loanRepo.countByStatus(LoanStatus.PENDING);
        long rejectedLoans = loanRepo.countByStatus(LoanStatus.REJECTED);
        long closedLoans   = loanRepo.countByStatus(LoanStatus.CLOSED);
        long overdueCount  = scheduleRepo.countByStatus(RepaymentStatus.OVERDUE);

        // Loan status breakdown for pie chart
        Map<String, Long> loanStatusCounts = new LinkedHashMap<>();
        loanStatusCounts.put("ACTIVE",   activeLoans);
        loanStatusCounts.put("PENDING",  pendingLoans);
        loanStatusCounts.put("CLOSED",   closedLoans);
        loanStatusCounts.put("REJECTED", rejectedLoans);

        // Currency distribution (active accounts)
        var activeAccountsList = accountRepo.findByStatus(AccountStatus.ACTIVE);
        var currencyDistribution = activeAccountsList.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getCurrency(),
                        Collectors.toList()
                ))
                .entrySet().stream()
                .map(e -> new AdminStatsResponse.CurrencyStat(
                        e.getKey(),
                        e.getValue().size(),
                        e.getValue().stream()
                                .map(a -> a.getBalance())
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .sorted(Comparator.comparing(AdminStatsResponse.CurrencyStat::totalBalance).reversed())
                .toList();

        // Monthly volume — last 6 months
        Instant since6Months = YearMonth.now().minusMonths(5)
                .atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        var recentTx = txRepo.findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(since6Months);

        Map<String, long[]> volumeMap = new LinkedHashMap<>();
        // Pre-fill all 6 months so chart has no gaps
        for (int i = 5; i >= 0; i--) {
            String key = YearMonth.now().minusMonths(i).toString();
            volumeMap.put(key, new long[]{0, 0}); // [deposits, withdrawals]
        }
        for (var tx : recentTx) {
            String month = YearMonth.from(tx.getCreatedAt().atZone(ZoneOffset.UTC)).toString();
            if (volumeMap.containsKey(month)) {
                if (tx.getType().contains("DEPOSIT") || tx.getType().contains("CREDIT") || tx.getType().contains("LOAN")) {
                    volumeMap.get(month)[0]++;
                } else {
                    volumeMap.get(month)[1]++;
                }
            }
        }
        var monthlyVolume = volumeMap.entrySet().stream()
                .map(e -> new AdminStatsResponse.MonthlyVolume(
                        e.getKey(), e.getValue()[0], e.getValue()[1]))
                .toList();

        return new AdminStatsResponse(
                totalUsers, activeUsers,
                totalAccounts, activeAccounts,
                totalLoans, activeLoans, pendingLoans, overdueCount,
                loanStatusCounts, currencyDistribution, monthlyVolume
        );
    }

    public record AdminStatsResponse(
            long totalUsers,
            long activeUsers,
            long totalAccounts,
            long activeAccounts,
            long totalLoans,
            long activeLoans,
            long pendingLoans,
            long overdueCount,
            Map<String, Long> loanStatusCounts,
            List<CurrencyStat> currencyDistribution,
            List<MonthlyVolume> monthlyVolume
    ) {
        public record CurrencyStat(String currency, long count, BigDecimal totalBalance) {}
        public record MonthlyVolume(String month, long deposits, long withdrawals) {}
    }
}

package com.example.Banking.account.controller;

import com.example.Banking.account.repository.AccountTransactionRepository;
import com.example.Banking.account.service.AccountService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/accounts", produces = MediaType.APPLICATION_JSON_VALUE)
public class TransactionController {

    private final AccountTransactionRepository txRepo;
    private final AccountService accountService;

    public TransactionController(AccountTransactionRepository txRepo, AccountService accountService) {
        this.txRepo = txRepo;
        this.accountService = accountService;
    }

    @GetMapping("/{id}/transactions")
    public Page<TransactionResponse> getTransactions(
            @PathVariable("id") UUID id,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth
    ) {
        var account = accountService.getById(id);

        if (!account.getOwnerId().toString().equals(auth.getName())) {
            throw new AccessDeniedException("Access denied");
        }

        return txRepo.findByAccountIdOrderByCreatedAtDesc(id, pageable)
                .map(e -> new TransactionResponse(
                        e.getId(),
                        e.getType(),
                        e.getCurrency(),
                        e.getAmount(),
                        e.getCreatedAt()
                ));
    }

    @GetMapping("/{id}/transactions/export")
    public void exportTransactions(
            @PathVariable("id") UUID id,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            Authentication auth,
            HttpServletResponse response
    ) throws IOException {
        var account = accountService.getById(id);

        if (!account.getOwnerId().toString().equals(auth.getName())) {
            throw new AccessDeniedException("Access denied");
        }

        LocalDate toDate   = (to   != null) ? LocalDate.parse(to)   : LocalDate.now(ZoneOffset.UTC);
        LocalDate fromDate = (from != null) ? LocalDate.parse(from)  : toDate.minusDays(90);

        Instant fromInstant = fromDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant toInstant   = toDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        var transactions = accountService.getTransactionsForExport(id, fromInstant, toInstant);

        String filename = "statement-" + id + "-" + fromDate + "-" + toDate + ".csv";
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        PrintWriter writer = response.getWriter();
        writer.println("id,type,currency,amount,createdAt");
        for (var tx : transactions) {
            writer.printf("%s,%s,%s,%s,%s%n",
                    tx.getId(),
                    tx.getType(),
                    tx.getCurrency(),
                    tx.getAmount().toPlainString(),
                    tx.getCreatedAt()
            );
        }
        writer.flush();
    }

    @GetMapping("/{id}/transactions/summary")
    public List<AccountService.DailyBalance> getBalanceSummary(
            @PathVariable("id") UUID id,
            @RequestParam(defaultValue = "30") int days,
            Authentication auth
    ) {
        var account = accountService.getById(id);

        if (!account.getOwnerId().toString().equals(auth.getName())) {
            throw new AccessDeniedException("Access denied");
        }

        if (days < 1 || days > 365) {
            throw new IllegalArgumentException("days must be between 1 and 365");
        }

        return accountService.getBalanceHistory(id, days);
    }
}

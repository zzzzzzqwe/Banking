package com.example.Banking.loan.controller;

import com.example.Banking.loan.model.Loan;
import com.example.Banking.loan.model.RepaymentScheduleEntry;
import com.example.Banking.loan.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    // ── User endpoints ──

    @PostMapping("/api/loans")
    @ResponseStatus(HttpStatus.CREATED)
    public LoanResponse apply(@RequestBody @Valid LoanApplicationRequest req, Authentication auth) {
        var loan = loanService.applyForLoan(
                auth.getName(), req.accountId(),
                req.amount(), req.annualInterestRate(), req.termMonths());
        return toResponse(loan);
    }

    @GetMapping("/api/loans")
    public List<LoanResponse> myLoans(Authentication auth) {
        return loanService.getLoansByBorrower(auth.getName())
                .stream().map(this::toResponse).toList();
    }

    @GetMapping("/api/loans/{id}")
    public LoanResponse getLoan(@PathVariable UUID id, Authentication auth) {
        return toResponse(loanService.getLoan(id, auth.getName()));
    }

    @GetMapping("/api/loans/{id}/schedule")
    public List<ScheduleEntryResponse> getSchedule(@PathVariable UUID id, Authentication auth) {
        return loanService.getSchedule(id, auth.getName())
                .stream().map(this::toScheduleResponse).toList();
    }

    @PostMapping("/api/loans/{id}/repay")
    public ScheduleEntryResponse repay(@PathVariable UUID id, Authentication auth) {
        return toScheduleResponse(loanService.makeRepayment(id, auth.getName()));
    }

    // ── Admin endpoints ──

    @GetMapping("/api/admin/loans")
    @PreAuthorize("hasRole('ADMIN')")
    public Page<LoanResponse> allLoans(@PageableDefault(size = 20) Pageable pageable) {
        return loanService.getAllLoans(pageable).map(this::toResponse);
    }

    @PostMapping("/api/admin/loans/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public LoanResponse approve(@PathVariable UUID id) {
        return toResponse(loanService.approveLoan(id));
    }

    @PostMapping("/api/admin/loans/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public LoanResponse reject(@PathVariable UUID id) {
        return toResponse(loanService.rejectLoan(id));
    }

    // ── Mappers ──

    private LoanResponse toResponse(Loan loan) {
        return new LoanResponse(
                loan.getId(),
                loan.getBorrowerId(),
                loan.getAccountId(),
                loan.getPrincipalAmount(),
                loan.getAnnualInterestRate(),
                loan.getTermMonths(),
                loan.getMonthlyPayment(),
                loan.getStatus().name(),
                loan.getStartDate(),
                loan.getEndDate(),
                loan.getCreatedAt()
        );
    }

    private ScheduleEntryResponse toScheduleResponse(RepaymentScheduleEntry e) {
        return new ScheduleEntryResponse(
                e.getInstallmentNumber(),
                e.getDueDate(),
                e.getPrincipal(),
                e.getInterest(),
                e.getTotalPayment(),
                e.getStatus().name(),
                e.getPaidAt()
        );
    }
}

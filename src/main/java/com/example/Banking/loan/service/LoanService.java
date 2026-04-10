package com.example.Banking.loan.service;

import com.example.Banking.account.service.AccountService;
import com.example.Banking.config.LoanNotFoundException;
import com.example.Banking.loan.model.Loan;
import com.example.Banking.loan.model.LoanStatus;
import com.example.Banking.loan.model.RepaymentScheduleEntry;
import com.example.Banking.loan.model.RepaymentStatus;
import com.example.Banking.loan.repository.LoanRepository;
import com.example.Banking.loan.repository.RepaymentScheduleRepository;
import com.example.Banking.notification.event.LoanRepaymentEvent;
import com.example.Banking.notification.event.LoanStatusChangedEvent;
import com.example.Banking.user.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LoanService {

    private final LoanRepository loanRepo;
    private final RepaymentScheduleRepository scheduleRepo;
    private final AccountService accountService;
    private final LoanCalculator calculator;
    private final UserRepository userRepo;
    private final ApplicationEventPublisher eventPublisher;

    public LoanService(LoanRepository loanRepo,
                       RepaymentScheduleRepository scheduleRepo,
                       AccountService accountService,
                       LoanCalculator calculator,
                       UserRepository userRepo,
                       ApplicationEventPublisher eventPublisher) {
        this.loanRepo = loanRepo;
        this.scheduleRepo = scheduleRepo;
        this.accountService = accountService;
        this.calculator = calculator;
        this.userRepo = userRepo;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Loan applyForLoan(String borrowerId, UUID accountId,
                              BigDecimal amount, BigDecimal annualRate, int termMonths) {
        var account = accountService.getById(accountId);
        if (!account.getOwnerId().toString().equals(borrowerId)) {
            throw new AccessDeniedException("Account does not belong to the current user");
        }

        var loan = new Loan(
                UUID.randomUUID(),
                UUID.fromString(borrowerId),
                accountId,
                amount,
                annualRate,
                termMonths,
                LoanStatus.PENDING,
                LocalDateTime.now()
        );
        return loanRepo.save(loan);
    }

    @Transactional
    public Loan approveLoan(UUID loanId) {
        var loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new LoanNotFoundException(loanId));

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new IllegalStateException(
                    "Loan must be PENDING to approve, current status: " + loan.getStatus());
        }

        BigDecimal monthlyPayment = calculator.monthlyPayment(
                loan.getPrincipalAmount(), loan.getAnnualInterestRate(), loan.getTermMonths());

        LocalDate startDate = LocalDate.now();
        loan.setMonthlyPayment(monthlyPayment);
        loan.setStartDate(startDate);
        loan.setEndDate(startDate.plusMonths(loan.getTermMonths()));
        loan.setStatus(LoanStatus.ACTIVE);
        loanRepo.save(loan);

        // Зачислить сумму кредита на счёт заёмщика
        var account = accountService.getById(loan.getAccountId());
        accountService.deposit(loan.getAccountId(), account.getCurrency(), loan.getPrincipalAmount());

        // Сформировать расписание платежей
        var schedule = calculator.buildSchedule(
                loan.getId(), loan.getPrincipalAmount(),
                loan.getAnnualInterestRate(), loan.getTermMonths(),
                startDate, monthlyPayment);
        scheduleRepo.saveAll(schedule);

        userRepo.findById(loan.getBorrowerId()).ifPresent(u ->
                eventPublisher.publishEvent(new LoanStatusChangedEvent(
                        u.getEmail(), u.getFirstName(), loan.getId(), "ACTIVE", monthlyPayment)));

        return loan;
    }

    @Transactional
    public Loan rejectLoan(UUID loanId) {
        var loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new LoanNotFoundException(loanId));

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new IllegalStateException(
                    "Loan must be PENDING to reject, current status: " + loan.getStatus());
        }

        loan.setStatus(LoanStatus.REJECTED);
        loanRepo.save(loan);

        userRepo.findById(loan.getBorrowerId()).ifPresent(u ->
                eventPublisher.publishEvent(new LoanStatusChangedEvent(
                        u.getEmail(), u.getFirstName(), loan.getId(), "REJECTED", null)));

        return loan;
    }

    @Transactional
    public RepaymentScheduleEntry makeRepayment(UUID loanId, String requesterId) {
        var loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new LoanNotFoundException(loanId));

        if (!loan.getBorrowerId().toString().equals(requesterId)) {
            throw new AccessDeniedException("Loan does not belong to the current user");
        }

        if (loan.getStatus() != LoanStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Cannot repay loan with status: " + loan.getStatus());
        }

        var entry = scheduleRepo
                .findFirstByLoanIdAndStatusOrderByInstallmentNumber(loanId, RepaymentStatus.PENDING)
                .orElseThrow(() -> new IllegalStateException("No pending installments found"));

        // Списать платёж со счёта заёмщика
        var account = accountService.getById(loan.getAccountId());
        accountService.withdraw(loan.getAccountId(), account.getCurrency(), entry.getTotalPayment());

        entry.setStatus(RepaymentStatus.PAID);
        entry.setPaidAt(LocalDate.now());
        scheduleRepo.save(entry);

        // Если больше нет незакрытых взносов — закрыть кредит
        int remaining = (int) scheduleRepo.findByLoanIdOrderByInstallmentNumber(loanId)
                .stream().filter(e2 -> e2.getStatus() == RepaymentStatus.PENDING).count();
        if (remaining == 0) {
            loan.setStatus(LoanStatus.CLOSED);
            loanRepo.save(loan);
        }

        userRepo.findById(loan.getBorrowerId()).ifPresent(u ->
                eventPublisher.publishEvent(new LoanRepaymentEvent(
                        u.getEmail(), entry.getInstallmentNumber(), entry.getTotalPayment(), remaining)));

        return entry;
    }

    public List<Loan> getLoansByBorrower(String borrowerId) {
        return loanRepo.findByBorrowerIdOrderByCreatedAtDesc(UUID.fromString(borrowerId));
    }

    public Loan getLoan(UUID loanId, String requesterId) {
        var loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new LoanNotFoundException(loanId));
        if (!loan.getBorrowerId().toString().equals(requesterId)) {
            throw new AccessDeniedException("Loan does not belong to the current user");
        }
        return loan;
    }

    public List<RepaymentScheduleEntry> getSchedule(UUID loanId, String requesterId) {
        var loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new LoanNotFoundException(loanId));
        if (!loan.getBorrowerId().toString().equals(requesterId)) {
            throw new AccessDeniedException("Loan does not belong to the current user");
        }
        return scheduleRepo.findByLoanIdOrderByInstallmentNumber(loanId);
    }

    public Page<Loan> getAllLoans(Pageable pageable) {
        return loanRepo.findAllByOrderByCreatedAtDesc(pageable);
    }
}

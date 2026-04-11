package com.example.Banking.loan.service;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.model.AccountStatus;
import com.example.Banking.account.service.AccountService;
import com.example.Banking.config.LoanNotFoundException;
import com.example.Banking.loan.model.*;
import com.example.Banking.loan.repository.LoanRepository;
import com.example.Banking.loan.repository.RepaymentScheduleRepository;
import com.example.Banking.user.model.Role;
import com.example.Banking.user.model.User;
import com.example.Banking.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock LoanRepository loanRepo;
    @Mock RepaymentScheduleRepository scheduleRepo;
    @Mock AccountService accountService;
    @Mock LoanCalculator calculator;
    @Mock UserRepository userRepo;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks LoanService loanService;

    private final UUID borrowerId = UUID.randomUUID();
    private final UUID accountId = UUID.randomUUID();

    private Account ownerAccount() {
        return new Account(accountId, borrowerId, new BigDecimal("1000.00"), "USD",
                AccountStatus.ACTIVE, LocalDateTime.now());
    }

    private Loan pendingLoan(UUID loanId) {
        return new Loan(loanId, borrowerId, accountId,
                new BigDecimal("10000"), new BigDecimal("0.12"), 12,
                LoanStatus.PENDING, LocalDateTime.now());
    }

    @Test
    void applyForLoan_success() {
        when(accountService.getById(accountId)).thenReturn(ownerAccount());
        when(loanRepo.save(any(Loan.class))).thenAnswer(inv -> inv.getArgument(0));

        Loan loan = loanService.applyForLoan(borrowerId.toString(), accountId,
                new BigDecimal("10000"), new BigDecimal("0.12"), 12);

        assertThat(loan.getStatus()).isEqualTo(LoanStatus.PENDING);
        assertThat(loan.getBorrowerId()).isEqualTo(borrowerId);
    }

    @Test
    void applyForLoan_wrongOwner_throwsAccessDenied() {
        UUID otherOwner = UUID.randomUUID();
        Account otherAccount = new Account(accountId, otherOwner, new BigDecimal("1000"), "USD",
                AccountStatus.ACTIVE, LocalDateTime.now());
        when(accountService.getById(accountId)).thenReturn(otherAccount);

        assertThatThrownBy(() -> loanService.applyForLoan(borrowerId.toString(), accountId,
                new BigDecimal("10000"), new BigDecimal("0.12"), 12))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void approveLoan_success() {
        UUID loanId = UUID.randomUUID();
        Loan loan = pendingLoan(loanId);
        Account account = ownerAccount();

        when(loanRepo.findById(loanId)).thenReturn(Optional.of(loan));
        when(calculator.monthlyPayment(any(), any(), eq(12))).thenReturn(new BigDecimal("888.49"));
        when(loanRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(accountService.getById(accountId)).thenReturn(account);
        when(accountService.deposit(eq(accountId), eq("USD"), any())).thenReturn(account);
        when(calculator.buildSchedule(any(), any(), any(), eq(12), any(), any()))
                .thenReturn(List.of());

        Loan result = loanService.approveLoan(loanId);

        assertThat(result.getStatus()).isEqualTo(LoanStatus.ACTIVE);
        assertThat(result.getMonthlyPayment()).isEqualByComparingTo("888.49");
        assertThat(result.getStartDate()).isEqualTo(LocalDate.now());
        assertThat(result.getEndDate()).isEqualTo(LocalDate.now().plusMonths(12));
        verify(accountService).deposit(eq(accountId), eq("USD"), eq(new BigDecimal("10000")));
        verify(scheduleRepo).saveAll(any());
    }

    @Test
    void approveLoan_notPending_throws() {
        UUID loanId = UUID.randomUUID();
        Loan loan = pendingLoan(loanId);
        loan.setStatus(LoanStatus.ACTIVE);

        when(loanRepo.findById(loanId)).thenReturn(Optional.of(loan));

        assertThatThrownBy(() -> loanService.approveLoan(loanId))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("PENDING");
    }

    @Test
    void approveLoan_notFound_throws() {
        UUID loanId = UUID.randomUUID();
        when(loanRepo.findById(loanId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> loanService.approveLoan(loanId))
                .isInstanceOf(LoanNotFoundException.class);
    }

    @Test
    void rejectLoan_success() {
        UUID loanId = UUID.randomUUID();
        Loan loan = pendingLoan(loanId);

        when(loanRepo.findById(loanId)).thenReturn(Optional.of(loan));
        when(loanRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Loan result = loanService.rejectLoan(loanId);

        assertThat(result.getStatus()).isEqualTo(LoanStatus.REJECTED);
    }

    @Test
    void rejectLoan_notPending_throws() {
        UUID loanId = UUID.randomUUID();
        Loan loan = pendingLoan(loanId);
        loan.setStatus(LoanStatus.ACTIVE);

        when(loanRepo.findById(loanId)).thenReturn(Optional.of(loan));

        assertThatThrownBy(() -> loanService.rejectLoan(loanId))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void makeRepayment_success() {
        UUID loanId = UUID.randomUUID();
        Loan loan = pendingLoan(loanId);
        loan.setStatus(LoanStatus.ACTIVE);
        Account account = ownerAccount();

        RepaymentScheduleEntry entry = new RepaymentScheduleEntry(
                UUID.randomUUID(), loanId, 1, LocalDate.now().plusMonths(1),
                new BigDecimal("800"), new BigDecimal("100"), new BigDecimal("900"),
                RepaymentStatus.PENDING, null);

        when(loanRepo.findById(loanId)).thenReturn(Optional.of(loan));
        when(scheduleRepo.findFirstByLoanIdAndStatusInOrderByInstallmentNumber(eq(loanId), anyList()))
                .thenReturn(Optional.of(entry));
        when(accountService.getById(accountId)).thenReturn(account);
        when(accountService.withdraw(eq(accountId), eq("USD"), eq(new BigDecimal("900"))))
                .thenReturn(account);
        // Still has pending entries
        when(scheduleRepo.findByLoanIdOrderByInstallmentNumber(loanId))
                .thenReturn(List.of(entry, new RepaymentScheduleEntry(
                        UUID.randomUUID(), loanId, 2, LocalDate.now().plusMonths(2),
                        new BigDecimal("800"), new BigDecimal("80"), new BigDecimal("880"),
                        RepaymentStatus.PENDING, null)));

        RepaymentScheduleEntry result = loanService.makeRepayment(loanId, borrowerId.toString());

        assertThat(result.getStatus()).isEqualTo(RepaymentStatus.PAID);
        assertThat(result.getPaidAt()).isEqualTo(LocalDate.now());
        verify(loanRepo, never()).save(argThat(l -> ((Loan) l).getStatus() == LoanStatus.CLOSED));
    }

    @Test
    void makeRepayment_lastInstallment_closesLoan() {
        UUID loanId = UUID.randomUUID();
        Loan loan = pendingLoan(loanId);
        loan.setStatus(LoanStatus.ACTIVE);
        Account account = ownerAccount();

        RepaymentScheduleEntry entry = new RepaymentScheduleEntry(
                UUID.randomUUID(), loanId, 1, LocalDate.now().plusMonths(1),
                new BigDecimal("10000"), new BigDecimal("100"), new BigDecimal("10100"),
                RepaymentStatus.PENDING, null);

        when(loanRepo.findById(loanId)).thenReturn(Optional.of(loan));
        when(scheduleRepo.findFirstByLoanIdAndStatusInOrderByInstallmentNumber(eq(loanId), anyList()))
                .thenReturn(Optional.of(entry));
        when(accountService.getById(accountId)).thenReturn(account);
        when(accountService.withdraw(any(), any(), any())).thenReturn(account);
        // After paying, entry status changed to PAID, so no PENDING left
        when(scheduleRepo.findByLoanIdOrderByInstallmentNumber(loanId))
                .thenReturn(List.of(entry));
        when(loanRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        loanService.makeRepayment(loanId, borrowerId.toString());

        assertThat(loan.getStatus()).isEqualTo(LoanStatus.CLOSED);
    }

    @Test
    void makeRepayment_notOwner_throwsAccessDenied() {
        UUID loanId = UUID.randomUUID();
        Loan loan = pendingLoan(loanId);
        loan.setStatus(LoanStatus.ACTIVE);

        when(loanRepo.findById(loanId)).thenReturn(Optional.of(loan));

        assertThatThrownBy(() -> loanService.makeRepayment(loanId, UUID.randomUUID().toString()))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void getLoan_notOwner_throwsAccessDenied() {
        UUID loanId = UUID.randomUUID();
        Loan loan = pendingLoan(loanId);

        when(loanRepo.findById(loanId)).thenReturn(Optional.of(loan));

        assertThatThrownBy(() -> loanService.getLoan(loanId, UUID.randomUUID().toString()))
                .isInstanceOf(AccessDeniedException.class);
    }
}

package com.example.Banking.loan.service;

import com.example.Banking.loan.model.Loan;
import com.example.Banking.loan.model.LoanStatus;
import com.example.Banking.loan.model.RepaymentScheduleEntry;
import com.example.Banking.loan.model.RepaymentStatus;
import com.example.Banking.loan.repository.LoanRepository;
import com.example.Banking.loan.repository.RepaymentScheduleRepository;
import com.example.Banking.notification.event.InstallmentOverdueEvent;
import com.example.Banking.user.model.Role;
import com.example.Banking.user.model.User;
import com.example.Banking.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OverdueDetectionServiceTest {

    @Mock RepaymentScheduleRepository scheduleRepo;
    @Mock LoanRepository loanRepo;
    @Mock UserRepository userRepo;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks OverdueDetectionService overdueDetectionService;

    private RepaymentScheduleEntry pendingEntry(UUID loanId, int number, LocalDate dueDate) {
        return new RepaymentScheduleEntry(
                UUID.randomUUID(), loanId, number, dueDate,
                new BigDecimal("100.00"), new BigDecimal("10.00"), new BigDecimal("110.00"),
                RepaymentStatus.PENDING, null
        );
    }

    private Loan fakeLoan(UUID loanId, UUID borrowerId) {
        return new Loan(loanId, borrowerId, UUID.randomUUID(),
                new BigDecimal("1000"), new BigDecimal("0.12"), 12,
                LoanStatus.ACTIVE, LocalDateTime.now());
    }

    private User fakeUser(UUID id) {
        return new User(id, "user@test.com", "hash", "John", "Doe",
                true, Role.USER, LocalDateTime.now());
    }

    @Test
    void markOverdueInstallments_marksAllPendingPastDue() {
        UUID loanId = UUID.randomUUID();
        UUID borrowerId = UUID.randomUUID();
        var entry1 = pendingEntry(loanId, 1, LocalDate.now().minusDays(5));
        var entry2 = pendingEntry(loanId, 2, LocalDate.now().minusDays(1));

        when(scheduleRepo.findByStatusAndDueDateBefore(RepaymentStatus.PENDING, LocalDate.now()))
                .thenReturn(List.of(entry1, entry2));
        when(loanRepo.findById(loanId)).thenReturn(Optional.of(fakeLoan(loanId, borrowerId)));
        when(userRepo.findById(borrowerId)).thenReturn(Optional.of(fakeUser(borrowerId)));
        when(scheduleRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        overdueDetectionService.markOverdueInstallments();

        assertThat(entry1.getStatus()).isEqualTo(RepaymentStatus.OVERDUE);
        assertThat(entry2.getStatus()).isEqualTo(RepaymentStatus.OVERDUE);
        verify(scheduleRepo, times(2)).save(any());

        ArgumentCaptor<InstallmentOverdueEvent> eventCaptor = ArgumentCaptor.forClass(InstallmentOverdueEvent.class);
        verify(eventPublisher, times(2)).publishEvent(eventCaptor.capture());
        assertThat(eventCaptor.getAllValues()).hasSize(2);
    }

    @Test
    void markOverdueInstallments_emptyList_doesNothing() {
        when(scheduleRepo.findByStatusAndDueDateBefore(RepaymentStatus.PENDING, LocalDate.now()))
                .thenReturn(List.of());

        overdueDetectionService.markOverdueInstallments();

        verify(scheduleRepo, never()).save(any());
        verify(eventPublisher, never()).publishEvent(any());
    }
}

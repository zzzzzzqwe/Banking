package com.example.Banking.loan.service;

import com.example.Banking.loan.model.RepaymentStatus;
import com.example.Banking.loan.repository.LoanRepository;
import com.example.Banking.loan.repository.RepaymentScheduleRepository;
import com.example.Banking.notification.event.InstallmentOverdueEvent;
import com.example.Banking.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@ConditionalOnProperty(name = "spring.task.scheduling.enabled", matchIfMissing = true)
@Service
public class OverdueDetectionService {

    private static final Logger log = LoggerFactory.getLogger(OverdueDetectionService.class);

    private final RepaymentScheduleRepository scheduleRepo;
    private final LoanRepository loanRepo;
    private final UserRepository userRepo;
    private final ApplicationEventPublisher eventPublisher;

    public OverdueDetectionService(RepaymentScheduleRepository scheduleRepo,
                                   LoanRepository loanRepo,
                                   UserRepository userRepo,
                                   ApplicationEventPublisher eventPublisher) {
        this.scheduleRepo  = scheduleRepo;
        this.loanRepo      = loanRepo;
        this.userRepo      = userRepo;
        this.eventPublisher = eventPublisher;
    }

    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void markOverdueInstallments() {
        LocalDate today = LocalDate.now();
        var overdue = scheduleRepo.findByStatusAndDueDateBefore(RepaymentStatus.PENDING, today);

        if (overdue.isEmpty()) {
            log.debug("No overdue installments found for {}", today);
            return;
        }

        log.info("Marking {} installment(s) as OVERDUE for date {}", overdue.size(), today);

        for (var entry : overdue) {
            entry.setStatus(RepaymentStatus.OVERDUE);
            scheduleRepo.save(entry);

            try {
                loanRepo.findById(entry.getLoanId()).ifPresent(loan ->
                    userRepo.findById(loan.getBorrowerId()).ifPresent(user ->
                        eventPublisher.publishEvent(new InstallmentOverdueEvent(
                                user.getEmail(),
                                user.getFirstName(),
                                loan.getId(),
                                entry.getInstallmentNumber(),
                                entry.getDueDate(),
                                entry.getTotalPayment()
                        ))
                    )
                );
            } catch (Exception e) {
                log.warn("Failed to publish overdue event for installment {}: {}",
                        entry.getId(), e.getMessage());
            }
        }
    }
}

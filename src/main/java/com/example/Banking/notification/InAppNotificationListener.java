package com.example.Banking.notification;

import com.example.Banking.notification.event.*;
import com.example.Banking.notification.model.NotificationType;
import com.example.Banking.notification.service.NotificationService;
import com.example.Banking.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class InAppNotificationListener {

    private static final Logger log = LoggerFactory.getLogger(InAppNotificationListener.class);

    private final NotificationService notificationService;
    private final UserRepository userRepo;

    public InAppNotificationListener(NotificationService notificationService,
                                     UserRepository userRepo) {
        this.notificationService = notificationService;
        this.userRepo = userRepo;
    }

    @Async
    @EventListener
    public void onTransferCompleted(TransferCompletedEvent event) {
        var recipient = userRepo.findByEmail(event.recipientEmail());
        recipient.ifPresent(user -> notificationService.createNotification(
                user.getId(),
                "Transfer Received",
                "You received " + event.amount() + " " + event.currency(),
                NotificationType.TRANSFER_RECEIVED
        ));

        var sender = userRepo.findByEmail(event.senderEmail());
        sender.ifPresent(user -> notificationService.createNotification(
                user.getId(),
                "Transfer Sent",
                "You sent " + event.amount() + " " + event.currency(),
                NotificationType.TRANSFER_RECEIVED
        ));
    }

    @Async
    @EventListener
    public void onLoanStatusChanged(LoanStatusChangedEvent event) {
        var user = userRepo.findByEmail(event.borrowerEmail());
        user.ifPresent(u -> {
            boolean approved = "ACTIVE".equals(event.newStatus());
            notificationService.createNotification(
                    u.getId(),
                    approved ? "Loan Approved" : "Loan Rejected",
                    approved
                            ? "Your loan has been approved. Monthly payment: " + event.monthlyPayment()
                            : "Your loan application has been rejected.",
                    approved ? NotificationType.LOAN_APPROVED : NotificationType.LOAN_REJECTED
            );
        });
    }

    @Async
    @EventListener
    public void onInstallmentOverdue(InstallmentOverdueEvent event) {
        var user = userRepo.findByEmail(event.borrowerEmail());
        user.ifPresent(u -> notificationService.createNotification(
                u.getId(),
                "Installment Overdue",
                "Installment #" + event.installmentNumber() + " for loan " + event.loanId() +
                        " is overdue. Amount: " + event.amount(),
                NotificationType.INSTALLMENT_OVERDUE
        ));
    }

    @Async
    @EventListener
    public void onLoanRepayment(LoanRepaymentEvent event) {
        var user = userRepo.findByEmail(event.borrowerEmail());
        user.ifPresent(u -> notificationService.createNotification(
                u.getId(),
                "Payment Processed",
                "Payment #" + event.installmentNumber() + " of " + event.amount() + " has been processed." +
                        (event.remaining() > 0 ? " Remaining: " + event.remaining() : " Loan fully repaid!"),
                NotificationType.LOAN_REPAYMENT
        ));
    }

    @Async
    @EventListener
    public void onSavingsGoalCompleted(SavingsGoalCompletedEvent event) {
        notificationService.createNotification(
                event.userId(),
                "Savings Goal Reached!",
                "Congratulations! You've reached your goal \"" + event.goalName() +
                        "\" of " + event.targetAmount() + " " + event.currency(),
                NotificationType.GOAL_COMPLETED
        );
    }
}

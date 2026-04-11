package com.example.Banking.notification;

import com.example.Banking.notification.event.InstallmentOverdueEvent;
import com.example.Banking.notification.event.LoanRepaymentEvent;
import com.example.Banking.notification.event.LoanStatusChangedEvent;
import com.example.Banking.notification.event.TransferCompletedEvent;
import com.example.Banking.notification.event.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    @EventListener
    public void onUserRegistered(UserRegisteredEvent event) {
        send(event.email(),
                "Welcome to Banking App!",
                "Hello, " + event.firstName() + "!\n\n" +
                "Your account has been created successfully.\n\n" +
                "Thank you for joining us.");
    }

    @Async
    @EventListener
    public void onTransferCompleted(TransferCompletedEvent event) {
        send(event.senderEmail(),
                "Transfer Sent",
                "You sent " + event.amount() + " " + event.currency() + ".\n" +
                "Transfer ID: " + event.transferId());

        send(event.recipientEmail(),
                "Transfer Received",
                "You received " + event.amount() + " " + event.currency() + ".\n" +
                "Transfer ID: " + event.transferId());
    }

    @Async
    @EventListener
    public void onLoanStatusChanged(LoanStatusChangedEvent event) {
        String subject;
        String body;

        if ("ACTIVE".equals(event.newStatus())) {
            subject = "Loan Approved";
            body = "Hello, " + event.firstName() + "!\n\n" +
                   "Your loan " + event.loanId() + " has been approved.\n" +
                   "Monthly payment: " + event.monthlyPayment() + "\n\n" +
                   "The funds have been credited to your account.";
        } else {
            subject = "Loan Application Rejected";
            body = "Hello, " + event.firstName() + "!\n\n" +
                   "Unfortunately, your loan application " + event.loanId() +
                   " has been rejected.\n\n" +
                   "Please contact support for more information.";
        }

        send(event.borrowerEmail(), subject, body);
    }

    @Async
    @EventListener
    public void onInstallmentOverdue(InstallmentOverdueEvent event) {
        send(event.borrowerEmail(),
                "Overdue Loan Installment — Action Required",
                "Hello, " + event.firstName() + "!\n\n" +
                "Installment #" + event.installmentNumber() + " for loan " + event.loanId() +
                " was due on " + event.dueDate() + " and is now OVERDUE.\n" +
                "Amount due: " + event.amount() + "\n\n" +
                "Please make your repayment as soon as possible to avoid further penalties.");
    }

    @Async
    @EventListener
    public void onLoanRepayment(LoanRepaymentEvent event) {
        String body = "Payment #" + event.installmentNumber() +
                      " of " + event.amount() + " has been processed.\n";
        if (event.remaining() > 0) {
            body += "Remaining installments: " + event.remaining();
        } else {
            body += "Congratulations! Your loan has been fully repaid.";
        }
        send(event.borrowerEmail(), "Loan Payment Confirmation", body);
    }

    private void send(String to, String subject, String text) {
        if (from == null || from.isBlank()) {
            log.debug("Mail not configured — skipping email to {}: {}", to, subject);
            return;
        }
        try {
            var msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(text);
            mailSender.send(msg);
            log.info("Email sent to {}: {}", to, subject);
        } catch (MailException e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}

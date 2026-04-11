package com.example.Banking.account.service;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.model.AccountStatus;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.account.repository.AccountTransactionRepository;
import com.example.Banking.config.AccountNotFoundException;
import com.example.Banking.config.InsufficientFundsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock AccountRepository accountRepo;
    @Mock AccountTransactionRepository txRepo;

    @InjectMocks AccountService accountService;

    private Account activeAccount(UUID id, UUID ownerId, BigDecimal balance, String currency) {
        return new Account(id, ownerId, balance, currency, AccountStatus.ACTIVE, LocalDateTime.now());
    }

    @Test
    void create_success() {
        when(accountRepo.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));

        UUID ownerId = UUID.randomUUID();
        Account account = accountService.create(ownerId.toString(), "USD", new BigDecimal("100.00"));

        assertThat(account.getCurrency()).isEqualTo("USD");
        assertThat(account.getBalance()).isEqualByComparingTo("100.00");
        assertThat(account.getStatus()).isEqualTo(AccountStatus.ACTIVE);
        assertThat(account.getOwnerId()).isEqualTo(ownerId);
    }

    @Test
    void create_negativeBalance_throws() {
        assertThatThrownBy(() -> accountService.create(UUID.randomUUID().toString(), "USD", new BigDecimal("-1")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("initialBalance must be >= 0");
    }

    @Test
    void getById_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(accountRepo.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getById(id))
                .isInstanceOf(AccountNotFoundException.class);
    }

    @Test
    void deposit_success() {
        UUID id = UUID.randomUUID();
        Account account = activeAccount(id, UUID.randomUUID(), new BigDecimal("100.00"), "USD");
        when(accountRepo.findById(id)).thenReturn(Optional.of(account));
        when(accountRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Account result = accountService.deposit(id, "USD", new BigDecimal("50.00"));

        assertThat(result.getBalance()).isEqualByComparingTo("150.00");
        verify(txRepo).save(any());
    }

    @Test
    void deposit_currencyMismatch_throws() {
        UUID id = UUID.randomUUID();
        Account account = activeAccount(id, UUID.randomUUID(), new BigDecimal("100.00"), "USD");
        when(accountRepo.findById(id)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> accountService.deposit(id, "EUR", new BigDecimal("50.00")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Currency mismatch");
    }

    @Test
    void deposit_closedAccount_throws() {
        UUID id = UUID.randomUUID();
        Account account = new Account(id, UUID.randomUUID(), new BigDecimal("100.00"), "USD",
                AccountStatus.CLOSED, LocalDateTime.now());
        when(accountRepo.findById(id)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> accountService.deposit(id, "USD", new BigDecimal("50.00")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("closed");
    }

    @Test
    void withdraw_success() {
        UUID id = UUID.randomUUID();
        Account account = activeAccount(id, UUID.randomUUID(), new BigDecimal("100.00"), "USD");
        when(accountRepo.findById(id)).thenReturn(Optional.of(account));
        when(accountRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Account result = accountService.withdraw(id, "USD", new BigDecimal("30.00"));

        assertThat(result.getBalance()).isEqualByComparingTo("70.00");
    }

    @Test
    void withdraw_insufficientFunds_throws() {
        UUID id = UUID.randomUUID();
        Account account = activeAccount(id, UUID.randomUUID(), new BigDecimal("10.00"), "USD");
        when(accountRepo.findById(id)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> accountService.withdraw(id, "USD", new BigDecimal("50.00")))
                .isInstanceOf(InsufficientFundsException.class);
    }

    @Test
    void withdraw_negativeAmount_throws() {
        UUID id = UUID.randomUUID();
        Account account = activeAccount(id, UUID.randomUUID(), new BigDecimal("100.00"), "USD");
        when(accountRepo.findById(id)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> accountService.withdraw(id, "USD", new BigDecimal("-5")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("amount must be > 0");
    }

    @Test
    void withdraw_currencyMismatch_throws() {
        UUID id = UUID.randomUUID();
        Account account = activeAccount(id, UUID.randomUUID(), new BigDecimal("100.00"), "USD");
        when(accountRepo.findById(id)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> accountService.withdraw(id, "EUR", new BigDecimal("10")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Currency mismatch");
    }

    @Test
    void close_success() {
        UUID id = UUID.randomUUID();
        Account account = activeAccount(id, UUID.randomUUID(), BigDecimal.ZERO, "USD");
        when(accountRepo.findById(id)).thenReturn(Optional.of(account));
        when(accountRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Account result = accountService.close(id);

        assertThat(result.getStatus()).isEqualTo(AccountStatus.CLOSED);
    }

    @Test
    void close_nonZeroBalance_throws() {
        UUID id = UUID.randomUUID();
        Account account = activeAccount(id, UUID.randomUUID(), new BigDecimal("50.00"), "USD");
        when(accountRepo.findById(id)).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> accountService.close(id))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("non-zero balance");
    }
}

package com.example.Banking.transaction.service;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.model.AccountStatus;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.transaction.model.IdempotencyRecord;
import com.example.Banking.transaction.repository.IdempotencyRepository;
import com.example.Banking.transaction.repository.TransferRepository;
import com.example.Banking.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {

    @Mock AccountRepository accountRepo;
    @Mock TransferRepository transferRepo;
    @Mock IdempotencyRepository idempotencyRepo;
    @Mock UserRepository userRepo;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks TransferService transferService;

    private final UUID ownerId = UUID.randomUUID();
    private final UUID fromId = UUID.randomUUID();
    private final UUID toId = UUID.randomUUID();

    private Account account(UUID id, UUID owner, BigDecimal balance, AccountStatus status) {
        return new Account(id, owner, balance, "USD", status, LocalDateTime.now());
    }

    @Test
    void transfer_success() {
        UUID otherOwner = UUID.randomUUID();
        Account from = account(fromId, ownerId, new BigDecimal("500.00"), AccountStatus.ACTIVE);
        Account to = account(toId, otherOwner, new BigDecimal("100.00"), AccountStatus.ACTIVE);

        when(idempotencyRepo.findByIdemKey("key-1")).thenReturn(Optional.empty());
        when(accountRepo.findById(fromId)).thenReturn(Optional.of(from));
        when(accountRepo.findById(toId)).thenReturn(Optional.of(to));

        UUID txId = transferService.transfer(
                ownerId.toString(), fromId.toString(), toId.toString(), "USD", "200", "key-1");

        assertThat(txId).isNotNull();
        assertThat(from.getBalance()).isEqualByComparingTo("300.00");
        assertThat(to.getBalance()).isEqualByComparingTo("300.00");
        verify(transferRepo).save(any());
        verify(idempotencyRepo).save(any());
    }

    @Test
    void transfer_idempotencyHit_returnsExisting() {
        UUID existingTxId = UUID.randomUUID();
        when(idempotencyRepo.findByIdemKey("key-dup"))
                .thenReturn(Optional.of(new IdempotencyRecord("key-dup", existingTxId, Instant.now())));

        UUID result = transferService.transfer(
                ownerId.toString(), fromId.toString(), toId.toString(), "USD", "100", "key-dup");

        assertThat(result).isEqualTo(existingTxId);
        verify(accountRepo, never()).findById(any());
    }

    @Test
    void transfer_notOwner_throwsAccessDenied() {
        UUID otherOwner = UUID.randomUUID();
        Account from = account(fromId, otherOwner, new BigDecimal("500.00"), AccountStatus.ACTIVE);
        Account to = account(toId, UUID.randomUUID(), new BigDecimal("100.00"), AccountStatus.ACTIVE);

        when(idempotencyRepo.findByIdemKey("key-2")).thenReturn(Optional.empty());
        when(accountRepo.findById(fromId)).thenReturn(Optional.of(from));
        when(accountRepo.findById(toId)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> transferService.transfer(
                ownerId.toString(), fromId.toString(), toId.toString(), "USD", "100", "key-2"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void transfer_closedFromAccount_throws() {
        Account from = account(fromId, ownerId, new BigDecimal("500.00"), AccountStatus.CLOSED);
        Account to = account(toId, UUID.randomUUID(), new BigDecimal("100.00"), AccountStatus.ACTIVE);

        when(idempotencyRepo.findByIdemKey("key-3")).thenReturn(Optional.empty());
        when(accountRepo.findById(fromId)).thenReturn(Optional.of(from));
        when(accountRepo.findById(toId)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> transferService.transfer(
                ownerId.toString(), fromId.toString(), toId.toString(), "USD", "100", "key-3"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("closed");
    }

    @Test
    void transfer_insufficientFunds_throws() {
        Account from = account(fromId, ownerId, new BigDecimal("50.00"), AccountStatus.ACTIVE);
        Account to = account(toId, UUID.randomUUID(), new BigDecimal("100.00"), AccountStatus.ACTIVE);

        when(idempotencyRepo.findByIdemKey("key-4")).thenReturn(Optional.empty());
        when(accountRepo.findById(fromId)).thenReturn(Optional.of(from));
        when(accountRepo.findById(toId)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> transferService.transfer(
                ownerId.toString(), fromId.toString(), toId.toString(), "USD", "200", "key-4"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("insufficient funds");
    }

    @Test
    void transfer_zeroAmount_throws() {
        Account from = account(fromId, ownerId, new BigDecimal("500.00"), AccountStatus.ACTIVE);
        Account to = account(toId, UUID.randomUUID(), new BigDecimal("100.00"), AccountStatus.ACTIVE);

        when(idempotencyRepo.findByIdemKey("key-5")).thenReturn(Optional.empty());
        when(accountRepo.findById(fromId)).thenReturn(Optional.of(from));
        when(accountRepo.findById(toId)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> transferService.transfer(
                ownerId.toString(), fromId.toString(), toId.toString(), "USD", "0", "key-5"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("amount must be > 0");
    }
}

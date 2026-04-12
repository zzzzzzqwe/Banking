package com.example.Banking.currency;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.model.AccountStatus;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.account.service.AccountService;
import com.example.Banking.config.InsufficientFundsException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CurrencyExchangeServiceTest {

    @Mock AccountRepository accountRepo;
    @Mock AccountService accountService;
    @Mock ExchangeRateService rateService;
    @Mock CurrencyExchangeRepository exchangeRepo;

    @InjectMocks CurrencyExchangeService service;

    private final UUID userId = UUID.randomUUID();
    private final UUID fromAccId = UUID.randomUUID();
    private final UUID toAccId = UUID.randomUUID();

    private Account makeAccount(UUID id, String currency, BigDecimal balance) {
        return new Account(id, userId, balance, currency, AccountStatus.ACTIVE, LocalDateTime.now());
    }

    @Test
    void exchange_success() {
        var from = makeAccount(fromAccId, "USD", new BigDecimal("1000.00"));
        var to = makeAccount(toAccId, "EUR", new BigDecimal("500.00"));

        when(accountRepo.findById(fromAccId)).thenReturn(Optional.of(from));
        when(accountRepo.findById(toAccId)).thenReturn(Optional.of(to));
        when(rateService.getRate("USD", "EUR")).thenReturn(new BigDecimal("0.925926"));
        when(accountRepo.save(any())).thenAnswer(i -> i.getArgument(0));
        when(exchangeRepo.save(any())).thenAnswer(i -> i.getArgument(0));

        var result = service.exchange(userId.toString(), fromAccId, toAccId, new BigDecimal("100.00"));

        assertThat(result.fromAmount()).isEqualByComparingTo("100.00");
        assertThat(result.fromCurrency()).isEqualTo("USD");
        assertThat(result.toCurrency()).isEqualTo("EUR");
        assertThat(result.toAmount()).isEqualByComparingTo("92.59");
        assertThat(result.rate()).isEqualByComparingTo("0.925926");

        verify(accountService).saveTransaction(eq(fromAccId), eq("EXCHANGE_OUT"), eq("USD"), eq(new BigDecimal("100.00")), eq("EXCHANGE"));
        verify(accountService).saveTransaction(eq(toAccId), eq("EXCHANGE_IN"), eq("EUR"), any(), eq("EXCHANGE"));
        verify(exchangeRepo).save(any(CurrencyExchange.class));
    }

    @Test
    void exchange_insufficientFunds() {
        var from = makeAccount(fromAccId, "USD", new BigDecimal("50.00"));
        var to = makeAccount(toAccId, "EUR", new BigDecimal("500.00"));

        when(accountRepo.findById(fromAccId)).thenReturn(Optional.of(from));
        when(accountRepo.findById(toAccId)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> service.exchange(userId.toString(), fromAccId, toAccId, new BigDecimal("100.00")))
                .isInstanceOf(InsufficientFundsException.class);
    }

    @Test
    void exchange_sameCurrency_rejected() {
        var from = makeAccount(fromAccId, "USD", new BigDecimal("1000.00"));
        var to = makeAccount(toAccId, "USD", new BigDecimal("500.00"));

        when(accountRepo.findById(fromAccId)).thenReturn(Optional.of(from));
        when(accountRepo.findById(toAccId)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> service.exchange(userId.toString(), fromAccId, toAccId, new BigDecimal("100.00")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("same currency");
    }

    @Test
    void exchange_notOwner_denied() {
        UUID otherId = UUID.randomUUID();
        // Both accounts belong to userId, but caller is otherId
        var from = makeAccount(fromAccId, "USD", new BigDecimal("1000.00"));
        var to = makeAccount(toAccId, "EUR", new BigDecimal("500.00"));

        when(accountRepo.findById(fromAccId)).thenReturn(Optional.of(from));
        when(accountRepo.findById(toAccId)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> service.exchange(otherId.toString(), fromAccId, toAccId, new BigDecimal("100.00")))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void exchange_negativeAmount_rejected() {
        var from = makeAccount(fromAccId, "USD", new BigDecimal("1000.00"));
        var to = makeAccount(toAccId, "EUR", new BigDecimal("500.00"));

        when(accountRepo.findById(fromAccId)).thenReturn(Optional.of(from));
        when(accountRepo.findById(toAccId)).thenReturn(Optional.of(to));

        assertThatThrownBy(() -> service.exchange(userId.toString(), fromAccId, toAccId, new BigDecimal("-10.00")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount must be > 0");
    }
}

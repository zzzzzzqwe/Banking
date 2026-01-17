package com.example.Banking.transaction.adapter.in.web;

import com.example.Banking.account.core.port.out.AccountRepositoryPort;
import com.example.Banking.transaction.core.port.in.TransferMoneyUseCase;
import com.example.Banking.transaction.core.port.out.IdempotencyPort;
import com.example.Banking.transaction.core.port.out.TransactionRepositoryPort;
import com.example.Banking.transaction.core.usecase.TransferMoneyService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TransactionBeansConfig {

    @Bean
    TransferMoneyUseCase transferMoneyUseCase(AccountRepositoryPort accounts,
                                              TransactionRepositoryPort txRepo,
                                              IdempotencyPort idempotency) {
        return new TransferMoneyService(accounts, txRepo, idempotency);
    }
}

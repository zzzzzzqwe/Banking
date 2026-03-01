package com.example.Banking.account.core.port.out;

import com.example.Banking.account.core.domain.Account;
import com.example.Banking.common.ids.AccountId;

import java.util.Optional;

public interface AccountRepositoryPort {
    Optional<Account> findById(AccountId id);
    Account save(Account account);
}
package com.example.Banking.account.core.domain;

import com.example.Banking.common.ids.AccountId;
import com.example.Banking.common.ids.UserId;
import com.example.Banking.common.money.Money;

import java.util.Objects;

public class Account {
    private final AccountId id;
    private final UserId ownerId;
    private Money balance;

    public Account(AccountId id, UserId ownerId, Money balance) {
        this.id = Objects.requireNonNull(id);
        this.ownerId = Objects.requireNonNull(ownerId);
        this.balance = Objects.requireNonNull(balance);
    }

    public AccountId id() { return id; }
    public UserId ownerId() { return ownerId; }
    public Money balance() { return balance; }

    public void debit(Money amount) {
        balance = balance.minus(amount);
    }

    public void credit(Money amount) {
        balance = balance.plus(amount);
    }
}


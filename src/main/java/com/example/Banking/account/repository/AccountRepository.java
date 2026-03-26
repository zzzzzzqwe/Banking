package com.example.Banking.account.repository;

import com.example.Banking.account.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {
    List<Account> findByOwnerId(UUID ownerId);
}

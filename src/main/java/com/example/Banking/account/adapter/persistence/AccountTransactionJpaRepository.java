package com.example.Banking.account.adapter.persistence;

import com.example.Banking.account.adapter.web.AccountTransactionJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AccountTransactionJpaRepository extends JpaRepository<AccountTransactionJpaEntity, UUID> {
    List<AccountTransactionJpaEntity> findTop50ByAccountIdOrderByCreatedAtDesc(UUID accountId);
}
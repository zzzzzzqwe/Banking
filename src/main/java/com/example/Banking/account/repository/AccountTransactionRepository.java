package com.example.Banking.account.repository;

import com.example.Banking.account.model.AccountTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, UUID> {
    Page<AccountTransaction> findByAccountIdOrderByCreatedAtDesc(UUID accountId, Pageable pageable);
    List<AccountTransaction> findByAccountIdAndCreatedAtBetweenOrderByCreatedAtAsc(
            UUID accountId, Instant from, Instant to);
    List<AccountTransaction> findByAccountIdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(
            UUID accountId, Instant since);
    List<AccountTransaction> findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(Instant since);
}

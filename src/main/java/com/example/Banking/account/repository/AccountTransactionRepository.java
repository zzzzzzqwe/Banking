package com.example.Banking.account.repository;

import com.example.Banking.account.model.AccountTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, UUID> {

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM AccountTransaction t " +
           "WHERE t.accountId = :accountId " +
           "AND t.type IN ('WITHDRAW', 'TRANSFER_OUT', 'EXCHANGE_OUT') " +
           "AND t.createdAt >= :since")
    BigDecimal sumExpensesSince(@Param("accountId") UUID accountId, @Param("since") Instant since);
    Page<AccountTransaction> findByAccountIdOrderByCreatedAtDesc(UUID accountId, Pageable pageable);
    List<AccountTransaction> findByAccountIdAndCreatedAtBetweenOrderByCreatedAtAsc(
            UUID accountId, Instant from, Instant to);
    List<AccountTransaction> findByAccountIdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(
            UUID accountId, Instant since);
    List<AccountTransaction> findByCreatedAtGreaterThanEqualOrderByCreatedAtAsc(Instant since);
    Page<AccountTransaction> findByAccountIdInOrderByCreatedAtDesc(List<UUID> accountIds, Pageable pageable);
}

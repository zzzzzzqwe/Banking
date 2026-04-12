package com.example.Banking.currency;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CurrencyExchangeRepository extends JpaRepository<CurrencyExchange, UUID> {
    Page<CurrencyExchange> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}

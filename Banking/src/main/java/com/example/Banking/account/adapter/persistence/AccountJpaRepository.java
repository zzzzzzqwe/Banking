package com.example.Banking.account.adapter.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AccountJpaRepository extends JpaRepository<AccountJpaEntity, UUID> {
}
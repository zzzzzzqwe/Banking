package com.example.Banking.beneficiary.repository;

import com.example.Banking.beneficiary.model.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, UUID> {
    List<Beneficiary> findByUserIdOrderByFavoriteDescLastUsedAtDescCreatedAtDesc(UUID userId);
}

package com.example.Banking.cardrequest.repository;

import com.example.Banking.cardrequest.model.CardRequest;
import com.example.Banking.cardrequest.model.CardRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CardRequestRepository extends JpaRepository<CardRequest, UUID> {

    List<CardRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<CardRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    boolean existsByAccountIdAndStatusAndRequestType(
            UUID accountId, CardRequestStatus status,
            com.example.Banking.cardrequest.model.CardRequestType requestType);

    List<CardRequest> findByUserIdAndStatus(UUID userId, CardRequestStatus status);
}

package com.example.Banking.cardrequest.service;

import com.example.Banking.account.service.AccountService;
import com.example.Banking.cardrequest.model.CardRequest;
import com.example.Banking.cardrequest.model.CardRequestStatus;
import com.example.Banking.cardrequest.model.CardRequestType;
import com.example.Banking.cardrequest.repository.CardRequestRepository;
import com.example.Banking.notification.event.CardRequestStatusChangedEvent;
import com.example.Banking.user.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CardRequestService {

    private final CardRequestRepository requestRepo;
    private final AccountService accountService;
    private final UserRepository userRepo;
    private final ApplicationEventPublisher eventPublisher;

    public CardRequestService(CardRequestRepository requestRepo,
                              AccountService accountService,
                              UserRepository userRepo,
                              ApplicationEventPublisher eventPublisher) {
        this.requestRepo = requestRepo;
        this.accountService = accountService;
        this.userRepo = userRepo;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public CardRequest createRequest(String requesterId, UUID accountId, CardRequestType type) {
        var account = accountService.getById(accountId);
        if (!account.getOwnerId().toString().equals(requesterId)) {
            throw new AccessDeniedException("Card does not belong to the current user");
        }

        if (type == CardRequestType.BLOCK && account.getStatus().name().equals("BLOCKED")) {
            throw new IllegalArgumentException("Card is already blocked");
        }
        if (type == CardRequestType.UNBLOCK && account.getStatus().name().equals("ACTIVE")) {
            throw new IllegalArgumentException("Card is already active");
        }
        if (account.getStatus().name().equals("CLOSED")) {
            throw new IllegalArgumentException("Card is closed");
        }

        if (requestRepo.existsByAccountIdAndStatusAndRequestType(accountId, CardRequestStatus.PENDING, type)) {
            throw new IllegalStateException("A pending " + type + " request already exists for this card");
        }

        var request = new CardRequest(
                UUID.randomUUID(),
                UUID.fromString(requesterId),
                accountId,
                type,
                CardRequestStatus.PENDING,
                LocalDateTime.now()
        );
        return requestRepo.save(request);
    }

    @Transactional
    public CardRequest approve(UUID requestId) {
        var request = requestRepo.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Card request not found"));

        if (request.getStatus() != CardRequestStatus.PENDING) {
            throw new IllegalStateException("Request must be PENDING to approve, current: " + request.getStatus());
        }

        if (request.getRequestType() == CardRequestType.BLOCK) {
            accountService.block(request.getAccountId());
        } else {
            accountService.unblock(request.getAccountId());
        }

        request.setStatus(CardRequestStatus.APPROVED);
        requestRepo.save(request);

        publishEvent(request);
        return request;
    }

    @Transactional
    public CardRequest reject(UUID requestId) {
        var request = requestRepo.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Card request not found"));

        if (request.getStatus() != CardRequestStatus.PENDING) {
            throw new IllegalStateException("Request must be PENDING to reject, current: " + request.getStatus());
        }

        request.setStatus(CardRequestStatus.REJECTED);
        requestRepo.save(request);

        publishEvent(request);
        return request;
    }

    public List<CardRequest> getUserRequests(String userId) {
        return requestRepo.findByUserIdOrderByCreatedAtDesc(UUID.fromString(userId));
    }

    public List<CardRequest> getUserPendingRequests(String userId) {
        return requestRepo.findByUserIdAndStatus(UUID.fromString(userId), CardRequestStatus.PENDING);
    }

    public Page<CardRequest> getAllRequests(Pageable pageable) {
        return requestRepo.findAllByOrderByCreatedAtDesc(pageable);
    }

    private void publishEvent(CardRequest request) {
        userRepo.findById(request.getUserId()).ifPresent(u ->
                eventPublisher.publishEvent(new CardRequestStatusChangedEvent(
                        u.getEmail(),
                        u.getFirstName(),
                        request.getAccountId(),
                        request.getRequestType().name(),
                        request.getStatus().name()
                ))
        );
    }
}

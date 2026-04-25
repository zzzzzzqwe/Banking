package com.example.Banking.beneficiary.service;

import com.example.Banking.account.model.Account;
import com.example.Banking.account.repository.AccountRepository;
import com.example.Banking.beneficiary.model.Beneficiary;
import com.example.Banking.beneficiary.repository.BeneficiaryRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository repo;
    private final AccountRepository accountRepo;

    public BeneficiaryService(BeneficiaryRepository repo, AccountRepository accountRepo) {
        this.repo = repo;
        this.accountRepo = accountRepo;
    }

    public List<Beneficiary> listForUser(UUID userId) {
        return repo.findByUserIdOrderByFavoriteDescLastUsedAtDescCreatedAtDesc(userId);
    }

    @Transactional
    public Beneficiary create(UUID userId, String nickname, String accountNumber,
                              String bankName, String holderName, String currency, boolean favorite) {
        if (nickname == null || nickname.isBlank()) throw new IllegalArgumentException("nickname required");
        if (accountNumber == null || accountNumber.isBlank()) throw new IllegalArgumentException("accountNumber required");
        if (currency == null || currency.isBlank()) throw new IllegalArgumentException("currency required");

        UUID accountId = resolveInternalAccountId(accountNumber);
        var b = new Beneficiary(UUID.randomUUID(), userId, nickname.trim(), accountNumber.trim(),
                accountId, bankName, holderName, currency, favorite, LocalDateTime.now());
        return repo.save(b);
    }

    @Transactional
    public Beneficiary update(UUID id, UUID userId, String nickname, String bankName, String holderName, Boolean favorite) {
        var b = getOwned(id, userId);
        if (nickname != null) b.setNickname(nickname);
        if (bankName != null) b.setBankName(bankName);
        if (holderName != null) b.setHolderName(holderName);
        if (favorite != null) b.setFavorite(favorite);
        return repo.save(b);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        var b = getOwned(id, userId);
        repo.delete(b);
    }

    @Transactional
    public void touchLastUsed(UUID id, UUID userId) {
        var b = getOwned(id, userId);
        b.setLastUsedAt(LocalDateTime.now());
        repo.save(b);
    }

    public Beneficiary getOwned(UUID id, UUID userId) {
        var b = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Beneficiary not found"));
        if (!b.getUserId().equals(userId)) throw new AccessDeniedException("Access denied");
        return b;
    }

    /** Matches the given number to an existing card (by UUID or card number). */
    private UUID resolveInternalAccountId(String accountNumber) {
        String trimmed = accountNumber.trim();
        try {
            UUID asUuid = UUID.fromString(trimmed);
            if (accountRepo.existsById(asUuid)) return asUuid;
        } catch (IllegalArgumentException ignored) { }
        String normalized = trimmed.replace(" ", "");
        for (Account a : accountRepo.findAll()) {
            if (a.getCardNumber() != null && a.getCardNumber().replace(" ", "").equals(normalized)) {
                return a.getId();
            }
        }
        return null;
    }
}

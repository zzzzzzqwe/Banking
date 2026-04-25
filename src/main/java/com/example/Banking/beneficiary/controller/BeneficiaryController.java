package com.example.Banking.beneficiary.controller;

import com.example.Banking.beneficiary.model.Beneficiary;
import com.example.Banking.beneficiary.service.BeneficiaryService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService service;

    public BeneficiaryController(BeneficiaryService service) {
        this.service = service;
    }

    @GetMapping
    public List<BeneficiaryResponse> list(Authentication auth) {
        return service.listForUser(UUID.fromString(auth.getName())).stream().map(this::toResponse).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BeneficiaryResponse create(@RequestBody CreateBeneficiaryRequest req, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        var b = service.create(userId, req.nickname, req.accountNumber, req.bankName, req.holderName, req.currency,
                Boolean.TRUE.equals(req.favorite));
        return toResponse(b);
    }

    @PutMapping("/{id}")
    public BeneficiaryResponse update(@PathVariable("id") UUID id, @RequestBody Map<String, Object> body, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        var b = service.update(id, userId,
                str(body.get("nickname")),
                str(body.get("bankName")),
                str(body.get("holderName")),
                body.get("favorite") == null ? null : Boolean.parseBoolean(body.get("favorite").toString()));
        return toResponse(b);
    }

    @PostMapping("/{id}/touch")
    public BeneficiaryResponse touch(@PathVariable("id") UUID id, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        service.touchLastUsed(id, userId);
        return toResponse(service.getOwned(id, userId));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") UUID id, Authentication auth) {
        service.delete(id, UUID.fromString(auth.getName()));
    }

    private BeneficiaryResponse toResponse(Beneficiary b) {
        return new BeneficiaryResponse(
                b.getId(), b.getNickname(), b.getAccountNumber(), b.getAccountId(),
                b.getBankName(), b.getHolderName(), b.getCurrency(), b.isFavorite(),
                b.getCreatedAt(), b.getLastUsedAt(), b.getAccountId() != null
        );
    }

    private String str(Object o) { return o == null ? null : o.toString(); }

    public static class CreateBeneficiaryRequest {
        @NotBlank public String nickname;
        @NotBlank public String accountNumber;
        public String bankName;
        public String holderName;
        @NotBlank public String currency;
        public Boolean favorite;
    }
}

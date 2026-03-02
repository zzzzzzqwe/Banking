package com.example.Banking.account.adapter.web;
import com.example.Banking.account.adapter.persistence.AccountTransactionJpaRepository;
import com.example.Banking.common.ids.AccountId;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/accounts", produces = MediaType.APPLICATION_JSON_VALUE)
public class TransactionController {

    private final AccountTransactionJpaRepository txRepo;

    public TransactionController(AccountTransactionJpaRepository txRepo) {
        this.txRepo = txRepo;
    }

    @GetMapping("/{id}/transactions")
    public List<TransactionResponse> getTransactions(@PathVariable("id") String id) {
        var accountId = AccountId.parse(id);

        return txRepo.findTop50ByAccountIdOrderByCreatedAtDesc(accountId.value())
                .stream()
                .map(e -> new TransactionResponse(
                        e.getId(),
                        e.getType(),
                        e.getCurrency(),
                        e.getAmount(),
                        e.getCreatedAt()
                ))
                .toList();
    }
}
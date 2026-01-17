package com.example.Banking.transaction.adapter.in.web;

import com.example.Banking.common.ids.IdempotencyKey;
import com.example.Banking.transaction.core.port.in.TransferMoneyUseCase;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    private final TransferMoneyUseCase useCase;

    public TransferController(TransferMoneyUseCase useCase) {
        this.useCase = useCase;
    }

    @PostMapping
    public ResponseEntity<TransferResponse> transfer(
            @RequestHeader("X-Idempotency-Key") String key,
            @RequestBody TransferRequest req
    ) {
        var txId = useCase.transfer(
                new TransferMoneyUseCase.TransferCommand(
                        req.fromAccountId, req.toAccountId, req.currency, req.amount
                ),
                new IdempotencyKey(key)
        );
        return ResponseEntity.ok(new TransferResponse(txId.value().toString()));
    }

    public static class TransferRequest {
        @NotBlank public String fromAccountId;
        @NotBlank public String toAccountId;
        @NotBlank public String currency;
        @NotBlank public String amount;
    }

    public record TransferResponse(String transactionId) {}
}

package com.example.Banking.currency;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping(path = "/api/exchange", produces = MediaType.APPLICATION_JSON_VALUE)
public class ExchangeRateController {

    private final ExchangeRateService rateService;
    private final CurrencyExchangeService exchangeService;

    public ExchangeRateController(ExchangeRateService rateService, CurrencyExchangeService exchangeService) {
        this.rateService = rateService;
        this.exchangeService = exchangeService;
    }

    @GetMapping("/rates")
    public Map<String, BigDecimal> getAllRates() {
        return rateService.getAllRates();
    }

    @GetMapping("/rate")
    public Map<String, Object> getRate(@RequestParam String from, @RequestParam String to) {
        BigDecimal rate = rateService.getRate(from, to);
        return Map.of("from", from.toUpperCase(), "to", to.toUpperCase(), "rate", rate);
    }

    @GetMapping("/currencies")
    public Set<String> getCurrencies() {
        return rateService.getSupportedCurrencies();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExchangeResponse exchange(@RequestBody @Valid ExchangeRequest req, Authentication auth) {
        return exchangeService.exchange(auth.getName(), req.fromAccountId(), req.toAccountId(), req.amount());
    }

    public record ExchangeHistoryEntry(
            UUID id, UUID fromAccountId, UUID toAccountId,
            BigDecimal fromAmount, BigDecimal toAmount,
            String fromCurrency, String toCurrency,
            BigDecimal exchangeRate, Instant createdAt
    ) {}

    @GetMapping("/history")
    public Page<ExchangeHistoryEntry> getHistory(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth
    ) {
        return exchangeService.getHistory(auth.getName(), pageable)
                .map(e -> new ExchangeHistoryEntry(
                        e.getId(), e.getFromAccountId(), e.getToAccountId(),
                        e.getFromAmount(), e.getToAmount(),
                        e.getFromCurrency(), e.getToCurrency(),
                        e.getExchangeRate(), e.getCreatedAt()
                ));
    }
}

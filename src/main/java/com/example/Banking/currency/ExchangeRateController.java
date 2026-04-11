package com.example.Banking.currency;

import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/exchange")
public class ExchangeRateController {

    private final ExchangeRateService rateService;

    public ExchangeRateController(ExchangeRateService rateService) {
        this.rateService = rateService;
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
}

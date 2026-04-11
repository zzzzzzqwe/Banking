package com.example.Banking.currency;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class ExchangeRateService {

    // 1 единица валюты = N USD
    private static final Map<String, BigDecimal> TO_USD = Map.of(
            "USD", BigDecimal.ONE,
            "EUR", new BigDecimal("1.08"),
            "GBP", new BigDecimal("1.27"),
            "RUB", new BigDecimal("0.011")
    );

    /**
     * Возвращает курс: 1 единица fromCurrency = X единиц toCurrency.
     */
    public BigDecimal getRate(String fromCurrency, String toCurrency) {
        String from = fromCurrency.toUpperCase();
        String to   = toCurrency.toUpperCase();

        if (from.equals(to)) return BigDecimal.ONE;

        BigDecimal fromUsd = TO_USD.get(from);
        BigDecimal toUsd   = TO_USD.get(to);

        if (fromUsd == null) throw new IllegalArgumentException("Unsupported currency: " + fromCurrency);
        if (toUsd == null)   throw new IllegalArgumentException("Unsupported currency: " + toCurrency);

        return fromUsd.divide(toUsd, 6, RoundingMode.HALF_UP);
    }

    /**
     * Возвращает все курсы в виде "USD_EUR" → 0.925926.
     */
    public Map<String, BigDecimal> getAllRates() {
        List<String> currencies = new ArrayList<>(TO_USD.keySet());
        Collections.sort(currencies);
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        for (String from : currencies) {
            for (String to : currencies) {
                result.put(from + "_" + to, getRate(from, to));
            }
        }
        return result;
    }

    public Set<String> getSupportedCurrencies() {
        Set<String> sorted = new TreeSet<>(TO_USD.keySet());
        return Collections.unmodifiableSet(sorted);
    }
}

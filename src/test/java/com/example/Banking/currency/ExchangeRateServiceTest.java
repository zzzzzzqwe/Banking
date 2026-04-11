package com.example.Banking.currency;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

class ExchangeRateServiceTest {

    private final ExchangeRateService service = new ExchangeRateService();

    @Test
    void getRate_sameCurrency_returnsOne() {
        assertThat(service.getRate("USD", "USD")).isEqualByComparingTo(BigDecimal.ONE);
    }

    @Test
    void getRate_usdToEur_isCorrect() {
        // 1 USD = 1.08/1.08 ... actually 1 USD = 1.0/1.08 EUR ≈ 0.925926
        BigDecimal rate = service.getRate("USD", "EUR");
        assertThat(rate).isGreaterThan(BigDecimal.ZERO);
        // Обратная проверка: EUR → USD должна быть обратной
        BigDecimal reverse = service.getRate("EUR", "USD");
        BigDecimal product = rate.multiply(reverse);
        // product ≈ 1.0 (с учётом погрешности округления)
        assertThat(product).isBetween(new BigDecimal("0.99"), new BigDecimal("1.01"));
    }

    @Test
    void getRate_unknownCurrency_throws() {
        assertThatThrownBy(() -> service.getRate("USD", "XYZ"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unsupported currency");
    }

    @Test
    void getAllRates_containsExpectedPairs() {
        var rates = service.getAllRates();
        assertThat(rates).containsKey("USD_EUR");
        assertThat(rates).containsKey("EUR_USD");
        assertThat(rates).containsKey("USD_USD");
        assertThat(rates.get("USD_USD")).isEqualByComparingTo(BigDecimal.ONE);
    }

    @Test
    void getSupportedCurrencies_includesMainCurrencies() {
        var currencies = service.getSupportedCurrencies();
        assertThat(currencies).contains("USD", "EUR", "GBP", "RUB");
    }
}

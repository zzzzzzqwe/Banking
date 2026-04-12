package com.example.Banking.currency;

import com.example.Banking.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class CurrencyExchangeControllerIT extends AbstractIntegrationTest {

    @Test
    void exchange_success() throws Exception {
        var user = registerUser("exch@test.com", "pass123", "Ex", "Change");
        String usdAccId = createAccount(user.token(), "USD", "1000");
        String eurAccId = createAccount(user.token(), "EUR", "0");

        String body = """
                {"fromAccountId":"%s","toAccountId":"%s","amount":100}
                """.formatted(usdAccId, eurAccId);

        mockMvc.perform(post("/api/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exchangeId").exists())
                .andExpect(jsonPath("$.fromAmount").value(100.0))
                .andExpect(jsonPath("$.fromCurrency").value("USD"))
                .andExpect(jsonPath("$.toCurrency").value("EUR"))
                .andExpect(jsonPath("$.toAmount").isNumber())
                .andExpect(jsonPath("$.rate").isNumber());
    }

    @Test
    void exchange_sameCurrency_returns400() throws Exception {
        var user = registerUser("exch2@test.com", "pass123", "Ex", "Change");
        String acc1 = createAccount(user.token(), "USD", "1000");
        String acc2 = createAccount(user.token(), "USD", "500");

        String body = """
                {"fromAccountId":"%s","toAccountId":"%s","amount":100}
                """.formatted(acc1, acc2);

        mockMvc.perform(post("/api/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void exchange_insufficientFunds_returns409() throws Exception {
        var user = registerUser("exch3@test.com", "pass123", "Ex", "Change");
        String usdAccId = createAccount(user.token(), "USD", "10");
        String eurAccId = createAccount(user.token(), "EUR", "0");

        String body = """
                {"fromAccountId":"%s","toAccountId":"%s","amount":100}
                """.formatted(usdAccId, eurAccId);

        mockMvc.perform(post("/api/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void exchange_otherUser_returns403() throws Exception {
        var user1 = registerUser("exch4@test.com", "pass123", "Ex", "One");
        var user2 = registerUser("exch5@test.com", "pass123", "Ex", "Two");
        String usdAccId = createAccount(user1.token(), "USD", "1000");
        String eurAccId = createAccount(user1.token(), "EUR", "0");

        String body = """
                {"fromAccountId":"%s","toAccountId":"%s","amount":100}
                """.formatted(usdAccId, eurAccId);

        mockMvc.perform(post("/api/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user2.token())
                        .content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void exchange_history_returnsPagedResults() throws Exception {
        var user = registerUser("exch6@test.com", "pass123", "Ex", "Hist");
        String usdAccId = createAccount(user.token(), "USD", "5000");
        String eurAccId = createAccount(user.token(), "EUR", "0");

        // Perform 2 exchanges
        for (int i = 0; i < 2; i++) {
            String body = """
                    {"fromAccountId":"%s","toAccountId":"%s","amount":100}
                    """.formatted(usdAccId, eurAccId);
            mockMvc.perform(post("/api/exchange")
                            .contentType(MediaType.APPLICATION_JSON)
                            .header("Authorization", "Bearer " + user.token())
                            .content(body))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(get("/api/exchange/history")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.content[0].fromCurrency").value("USD"))
                .andExpect(jsonPath("$.content[0].toCurrency").value("EUR"));
    }

    @Test
    void exchange_unauthenticated_returnsForbiddenOrUnauthorized() throws Exception {
        mockMvc.perform(post("/api/exchange")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromAccountId\":\"x\",\"toAccountId\":\"y\",\"amount\":100}"))
                .andExpect(status().isForbidden());
    }
}

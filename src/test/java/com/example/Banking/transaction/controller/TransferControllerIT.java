package com.example.Banking.transaction.controller;

import com.example.Banking.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class TransferControllerIT extends AbstractIntegrationTest {

    @Test
    void transfer_success() throws Exception {
        var sender = registerUser("sender@test.com", "pass123", "John", "Doe");
        var receiver = registerUser("recv@test.com", "pass123", "Jane", "Doe");

        String fromId = createAccount(sender.token(), "USD", "500");
        String toId = createAccount(receiver.token(), "USD", "100");

        mockMvc.perform(post("/api/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + sender.token())
                        .header("X-Idempotency-Key", UUID.randomUUID().toString())
                        .content("""
                                {"fromAccountId":"%s","toAccountId":"%s","currency":"USD","amount":"200"}
                                """.formatted(fromId, toId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transactionId").isNotEmpty());
    }

    @Test
    void transfer_idempotencyReplay_returnsSameId() throws Exception {
        var sender = registerUser("idem@test.com", "pass123", "John", "Doe");
        var receiver = registerUser("idemr@test.com", "pass123", "Jane", "Doe");

        String fromId = createAccount(sender.token(), "USD", "500");
        String toId = createAccount(receiver.token(), "USD", "100");

        String idemKey = UUID.randomUUID().toString();
        String body = """
                {"fromAccountId":"%s","toAccountId":"%s","currency":"USD","amount":"100"}
                """.formatted(fromId, toId);

        var result1 = mockMvc.perform(post("/api/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + sender.token())
                        .header("X-Idempotency-Key", idemKey)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        String txId1 = objectMapper.readTree(result1.getResponse().getContentAsString())
                .get("transactionId").asText();

        var result2 = mockMvc.perform(post("/api/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + sender.token())
                        .header("X-Idempotency-Key", idemKey)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        String txId2 = objectMapper.readTree(result2.getResponse().getContentAsString())
                .get("transactionId").asText();

        org.assertj.core.api.Assertions.assertThat(txId1).isEqualTo(txId2);
    }

    @Test
    void transfer_missingIdempotencyKey_returns400() throws Exception {
        var sender = registerUser("nokey@test.com", "pass123", "John", "Doe");
        String fromId = createAccount(sender.token(), "USD", "500");

        mockMvc.perform(post("/api/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + sender.token())
                        .content("""
                                {"fromAccountId":"%s","toAccountId":"%s","currency":"USD","amount":"100"}
                                """.formatted(fromId, UUID.randomUUID())))
                .andExpect(status().isBadRequest());
    }

    @Test
    void transfer_insufficientFunds_returns400() throws Exception {
        var sender = registerUser("poor@test.com", "pass123", "John", "Doe");
        var receiver = registerUser("rich@test.com", "pass123", "Jane", "Doe");

        String fromId = createAccount(sender.token(), "USD", "10");
        String toId = createAccount(receiver.token(), "USD", "100");

        mockMvc.perform(post("/api/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + sender.token())
                        .header("X-Idempotency-Key", UUID.randomUUID().toString())
                        .content("""
                                {"fromAccountId":"%s","toAccountId":"%s","currency":"USD","amount":"500"}
                                """.formatted(fromId, toId)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void transfer_otherUsersAccount_returns403() throws Exception {
        var user1 = registerUser("u1@test.com", "pass123", "John", "Doe");
        var user2 = registerUser("u2@test.com", "pass123", "Jane", "Doe");

        String fromId = createAccount(user1.token(), "USD", "500");
        String toId = createAccount(user2.token(), "USD", "100");

        // user2 tries to transfer FROM user1's account
        mockMvc.perform(post("/api/transfers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user2.token())
                        .header("X-Idempotency-Key", UUID.randomUUID().toString())
                        .content("""
                                {"fromAccountId":"%s","toAccountId":"%s","currency":"USD","amount":"100"}
                                """.formatted(fromId, toId)))
                .andExpect(status().isForbidden());
    }
}

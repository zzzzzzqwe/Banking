package com.example.Banking.account.controller;

import com.example.Banking.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AccountControllerIT extends AbstractIntegrationTest {

    @Test
    void createAccount_returns201() throws Exception {
        var user = registerUser("acc@test.com", "pass123", "John", "Doe");

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"currency":"USD","initialBalance":100.00}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty());
    }

    @Test
    void listAccounts_returnsOwnAccounts() throws Exception {
        var user = registerUser("list@test.com", "pass123", "John", "Doe");
        createAccount(user.token(), "USD", "500");

        mockMvc.perform(get("/api/accounts")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].currency").value("USD"));
    }

    @Test
    void getAccount_ownerAccess() throws Exception {
        var user = registerUser("get@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "EUR", "200");

        mockMvc.perform(get("/api/accounts/" + accountId)
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(200.00))
                .andExpect(jsonPath("$.currency").value("EUR"));
    }

    @Test
    void getAccount_otherUser_returns403() throws Exception {
        var user1 = registerUser("owner@test.com", "pass123", "John", "Doe");
        var user2 = registerUser("other@test.com", "pass123", "Jane", "Doe");
        String accountId = createAccount(user1.token(), "USD", "100");

        mockMvc.perform(get("/api/accounts/" + accountId)
                        .header("Authorization", "Bearer " + user2.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    void deposit_success() throws Exception {
        var user = registerUser("dep@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "USD", "100");

        mockMvc.perform(post("/api/accounts/" + accountId + "/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"currency":"USD","amount":50.00}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(150.00));
    }

    @Test
    void deposit_currencyMismatch_returns400() throws Exception {
        var user = registerUser("depm@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "USD", "100");

        mockMvc.perform(post("/api/accounts/" + accountId + "/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"currency":"EUR","amount":50.00}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void withdraw_success() throws Exception {
        var user = registerUser("wd@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "USD", "100");

        mockMvc.perform(post("/api/accounts/" + accountId + "/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"currency":"USD","amount":30.00}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(70.00));
    }

    @Test
    void withdraw_insufficientFunds_returns409() throws Exception {
        var user = registerUser("wdi@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "USD", "10");

        mockMvc.perform(post("/api/accounts/" + accountId + "/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"currency":"USD","amount":50.00}
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void close_zeroBalance_success() throws Exception {
        var user = registerUser("cl@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "USD", "0");

        mockMvc.perform(post("/api/accounts/" + accountId + "/close")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    @Test
    void close_nonZeroBalance_returns400() throws Exception {
        var user = registerUser("clnz@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "USD", "50");

        mockMvc.perform(post("/api/accounts/" + accountId + "/close")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unauthenticated_returns403() throws Exception {
        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isForbidden());
    }
}

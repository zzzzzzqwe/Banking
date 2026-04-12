package com.example.Banking.account.controller;

import com.example.Banking.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AnalyticsControllerIT extends AbstractIntegrationTest {

    @Test
    void analytics_returns200() throws Exception {
        var user = registerUser("analytics@test.com", "pass123", "An", "Alytics");
        String accId = createAccount(user.token(), "USD", "1000");

        // Make a deposit with category
        mockMvc.perform(post("/api/accounts/" + accId + "/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"currency":"USD","amount":100,"category":"SALARY"}
                                """))
                .andExpect(status().isOk());

        // Make a withdrawal with category
        mockMvc.perform(post("/api/accounts/" + accId + "/withdraw")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"currency":"USD","amount":50,"category":"GROCERIES"}
                                """))
                .andExpect(status().isOk());

        // Get analytics
        mockMvc.perform(get("/api/accounts/" + accId + "/analytics?days=30")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncome").isNumber())
                .andExpect(jsonPath("$.totalExpense").isNumber())
                .andExpect(jsonPath("$.net").isNumber())
                .andExpect(jsonPath("$.categoryBreakdown").isArray())
                .andExpect(jsonPath("$.dailyAggregates").isArray());
    }

    @Test
    void updateCategory_success() throws Exception {
        var user = registerUser("cat1@test.com", "pass123", "Cat", "One");
        String accId = createAccount(user.token(), "USD", "1000");

        // Make a deposit (no category)
        mockMvc.perform(post("/api/accounts/" + accId + "/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"currency":"USD","amount":100}
                                """))
                .andExpect(status().isOk());

        // Get transactions to find the tx id
        var txResult = mockMvc.perform(get("/api/accounts/" + accId + "/transactions")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andReturn();

        var json = objectMapper.readTree(txResult.getResponse().getContentAsString());
        String txId = json.get("content").get(0).get("id").asText();

        // Update category
        mockMvc.perform(patch("/api/transactions/" + txId + "/category")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"category":"SALARY"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.category").value("SALARY"));
    }

    @Test
    void updateCategory_otherUser_returns403() throws Exception {
        var user1 = registerUser("cat2@test.com", "pass123", "Cat", "Two");
        var user2 = registerUser("cat3@test.com", "pass123", "Cat", "Three");
        String accId = createAccount(user1.token(), "USD", "1000");

        mockMvc.perform(post("/api/accounts/" + accId + "/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user1.token())
                        .content("""
                                {"currency":"USD","amount":100}
                                """))
                .andExpect(status().isOk());

        var txResult = mockMvc.perform(get("/api/accounts/" + accId + "/transactions")
                        .header("Authorization", "Bearer " + user1.token()))
                .andReturn();

        var json = objectMapper.readTree(txResult.getResponse().getContentAsString());
        String txId = json.get("content").get(0).get("id").asText();

        // User2 tries to update category on user1's transaction
        mockMvc.perform(patch("/api/transactions/" + txId + "/category")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user2.token())
                        .content("""
                                {"category":"OTHER"}
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    void analytics_differentPeriods() throws Exception {
        var user = registerUser("cat4@test.com", "pass123", "Cat", "Four");
        String accId = createAccount(user.token(), "USD", "1000");

        mockMvc.perform(get("/api/accounts/" + accId + "/analytics?days=7")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dailyAggregates").isArray());

        mockMvc.perform(get("/api/accounts/" + accId + "/analytics?days=365")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dailyAggregates").isArray());
    }

    @Test
    void analytics_invalidDays_returns400() throws Exception {
        var user = registerUser("cat5@test.com", "pass123", "Cat", "Five");
        String accId = createAccount(user.token(), "USD", "1000");

        mockMvc.perform(get("/api/accounts/" + accId + "/analytics?days=0")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void transactionResponse_includesCategory() throws Exception {
        var user = registerUser("cat6@test.com", "pass123", "Cat", "Six");
        String accId = createAccount(user.token(), "USD", "1000");

        mockMvc.perform(post("/api/accounts/" + accId + "/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"currency":"USD","amount":50,"category":"SALARY"}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/accounts/" + accId + "/transactions")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].category").value("SALARY"));
    }
}

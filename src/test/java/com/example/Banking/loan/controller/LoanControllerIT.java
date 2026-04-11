package com.example.Banking.loan.controller;

import com.example.Banking.AbstractIntegrationTest;
import com.example.Banking.config.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class LoanControllerIT extends AbstractIntegrationTest {

    private String adminToken() {
        return jwtTokenProvider.generateToken(UUID.randomUUID().toString(), "admin@bank.local", "ADMIN");
    }

    @Test
    void applyForLoan_returns201() throws Exception {
        var user = registerUser("loan@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "USD", "0");

        mockMvc.perform(post("/api/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"accountId":"%s","amount":10000,"annualInterestRate":0.12,"termMonths":12}
                                """.formatted(accountId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.principalAmount").value(10000));
    }

    @Test
    void listLoans_returnsUserLoans() throws Exception {
        var user = registerUser("loanlist@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "USD", "0");

        // Apply for a loan
        mockMvc.perform(post("/api/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"accountId":"%s","amount":5000,"annualInterestRate":0.10,"termMonths":6}
                                """.formatted(accountId)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/loans")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void fullLifecycle_apply_approve_repay_close() throws Exception {
        // 1. Register user and create account
        var user = registerUser("lifecycle@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "USD", "50000");

        // 2. Apply for loan (zero-rate for simpler math)
        var applyResult = mockMvc.perform(post("/api/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"accountId":"%s","amount":3000,"annualInterestRate":0.0,"termMonths":3}
                                """.formatted(accountId)))
                .andExpect(status().isCreated())
                .andReturn();

        String loanId = objectMapper.readTree(applyResult.getResponse().getContentAsString())
                .get("id").asText();

        // 3. Admin approves
        String admin = adminToken();
        mockMvc.perform(post("/api/admin/loans/" + loanId + "/approve")
                        .header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.monthlyPayment").value(1000.00));

        // 4. Verify schedule has 3 entries
        mockMvc.perform(get("/api/loans/" + loanId + "/schedule")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));

        // 5. Make 3 repayments
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/loans/" + loanId + "/repay")
                            .header("Authorization", "Bearer " + user.token()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("PAID"));
        }

        // 6. Loan should be closed
        mockMvc.perform(get("/api/loans/" + loanId)
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));
    }

    @Test
    void adminEndpoint_userRole_returns403() throws Exception {
        var user = registerUser("noadmin@test.com", "pass123", "John", "Doe");

        mockMvc.perform(get("/api/admin/loans")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminApprove_userRole_returns403() throws Exception {
        var user = registerUser("noapprove@test.com", "pass123", "John", "Doe");

        mockMvc.perform(post("/api/admin/loans/" + UUID.randomUUID() + "/approve")
                        .header("Authorization", "Bearer " + user.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    void rejectLoan_success() throws Exception {
        var user = registerUser("reject@test.com", "pass123", "John", "Doe");
        String accountId = createAccount(user.token(), "USD", "0");

        var applyResult = mockMvc.perform(post("/api/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user.token())
                        .content("""
                                {"accountId":"%s","amount":5000,"annualInterestRate":0.10,"termMonths":6}
                                """.formatted(accountId)))
                .andExpect(status().isCreated())
                .andReturn();

        String loanId = objectMapper.readTree(applyResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(post("/api/admin/loans/" + loanId + "/reject")
                        .header("Authorization", "Bearer " + adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));
    }

    @Test
    void getLoan_otherUser_returns403() throws Exception {
        var user1 = registerUser("loanowner@test.com", "pass123", "John", "Doe");
        var user2 = registerUser("loanother@test.com", "pass123", "Jane", "Doe");
        String accountId = createAccount(user1.token(), "USD", "0");

        var applyResult = mockMvc.perform(post("/api/loans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + user1.token())
                        .content("""
                                {"accountId":"%s","amount":5000,"annualInterestRate":0.10,"termMonths":6}
                                """.formatted(accountId)))
                .andExpect(status().isCreated())
                .andReturn();

        String loanId = objectMapper.readTree(applyResult.getResponse().getContentAsString())
                .get("id").asText();

        mockMvc.perform(get("/api/loans/" + loanId)
                        .header("Authorization", "Bearer " + user2.token()))
                .andExpect(status().isForbidden());
    }
}

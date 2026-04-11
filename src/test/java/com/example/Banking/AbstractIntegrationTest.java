package com.example.Banking;

import com.example.Banking.config.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class AbstractIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    protected ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    protected JwtTokenProvider jwtTokenProvider;

    protected record RegisteredUser(String userId, String token, String role) {}

    protected RegisteredUser registerUser(String email, String password,
                                           String firstName, String lastName) throws Exception {
        String body = """
                {"email":"%s","password":"%s","firstName":"%s","lastName":"%s"}
                """.formatted(email, password, firstName, lastName);

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        String userId = json.get("userId").asText();
        String role = json.get("role").asText();

        // Generate a real token for subsequent requests
        String token = jwtTokenProvider.generateToken(userId, email, role);
        return new RegisteredUser(userId, token, role);
    }

    protected String loginAndGetToken(String email, String password) throws Exception {
        String body = """
                {"email":"%s","password":"%s"}
                """.formatted(email, password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("token").asText();
    }

    protected String createAccount(String token, String currency, String initialBalance) throws Exception {
        String body = """
                {"currency":"%s","initialBalance":%s}
                """.formatted(currency, initialBalance);

        MvcResult result = mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + token)
                        .content(body))
                .andReturn();

        var json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asText();
    }
}

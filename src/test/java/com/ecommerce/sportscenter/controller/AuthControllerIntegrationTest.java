package com.ecommerce.sportscenter.controller;

import com.ecommerce.sportscenter.model.RegisterRequest;
import com.ecommerce.sportscenter.repository.UserAccountRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @BeforeEach
    void setUp() {
        userAccountRepository.deleteAll();
    }

    @Test
    @DisplayName("Register creates a new user and returns a JWT")
    void registerCreatesUserAndReturnsJwt() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("integration-user")
                .email("integration@example.com")
                .password("secret123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("integration-user"))
                .andExpect(jsonPath("$.token").isString());

        assertThat(userAccountRepository.existsByUsernameIgnoreCase("integration-user")).isTrue();
        assertThat(userAccountRepository.existsByEmailIgnoreCase("integration@example.com")).isTrue();
    }

    @Test
    @DisplayName("Register returns conflict when the username already exists")
    void registerReturnsConflictForDuplicateUsername() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("integration-user")
                .email("first@example.com")
                .password("secret123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        RegisterRequest duplicateRequest = RegisterRequest.builder()
                .username("integration-user")
                .email("second@example.com")
                .password("secret123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("User already exists"))
                .andExpect(jsonPath("$.message").value("Username is already taken"));
    }

    @Test
    @DisplayName("Login authenticates a registered user and returns a JWT")
    void loginAuthenticatesRegisteredUser() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username("login-user")
                .email("login@example.com")
                .password("secret123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  \"username\": \"login-user\",
                                  \"password\": \"secret123\"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("login-user"))
                .andExpect(jsonPath("$.token").isString());
    }

    @Test
    @DisplayName("Login returns unauthorized for an invalid password")
    void loginReturnsUnauthorizedForInvalidPassword() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username("login-user")
                .email("login@example.com")
                .password("secret123")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  \"username\": \"login-user\",
                                  \"password\": \"wrong-password\"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Authentication failed"))
                .andExpect(jsonPath("$.message").value("Invalid UserName or Password"));
    }

    @Test
    @DisplayName("User endpoint returns the authenticated user when a bearer token is provided")
    void userEndpointReturnsAuthenticatedUser() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .username("token-user")
                .email("token@example.com")
                .password("secret123")
                .build();

        String registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode responseBody = objectMapper.readTree(registerResponse);
        String token = responseBody.get("token").asText();

        mockMvc.perform(get("/api/auth/user")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("token-user"));
    }

    @Test
    @DisplayName("User endpoint returns bad request when the bearer prefix is missing")
    void userEndpointRejectsInvalidAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/api/auth/user")
                        .header("Authorization", "invalid-token"))
                .andExpect(status().isBadRequest());
    }
}

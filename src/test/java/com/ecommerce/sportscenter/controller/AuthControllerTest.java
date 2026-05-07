package com.ecommerce.sportscenter.controller;

import com.ecommerce.sportscenter.model.JwtRequest;
import com.ecommerce.sportscenter.model.JwtResponse;
import com.ecommerce.sportscenter.model.RegisterRequest;
import com.ecommerce.sportscenter.security.JwtHelper;
import com.ecommerce.sportscenter.service.UserAccountService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserAccountService userAccountService;

    @Mock
    private AuthenticationManager manager;

    @Mock
    private JwtHelper jwtHelper;

    @InjectMocks
    private AuthController authController;

    @Test
    @DisplayName("Login authenticates the request and returns a JWT response")
    void loginAuthenticatesAndReturnsJwt() {
        JwtRequest request = JwtRequest.builder()
                .username("tests")
                .password("secret123")
                .build();
        UserDetails userDetails = User.withUsername("tests")
                .password("encoded-password")
                .roles("USER")
                .build();

        when(userAccountService.loadUserByUsername("tests")).thenReturn(userDetails);
        when(jwtHelper.generateToken(userDetails)).thenReturn("jwt-token");

        ResponseEntity<JwtResponse> response = authController.login(request);

        ArgumentCaptor<UsernamePasswordAuthenticationToken> tokenCaptor =
                ArgumentCaptor.forClass(UsernamePasswordAuthenticationToken.class);
        verify(manager).authenticate(tokenCaptor.capture());

        UsernamePasswordAuthenticationToken authenticationToken = tokenCaptor.getValue();
        assertThat(authenticationToken.getPrincipal()).isEqualTo("tests");
        assertThat(authenticationToken.getCredentials()).isEqualTo("secret123");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getUsername()).isEqualTo("tests");
        assertThat(response.getBody().getToken()).isEqualTo("jwt-token");
    }

    @Test
    @DisplayName("Login rewrites bad credentials to the API-friendly message")
    void loginRewritesBadCredentialsMessage() {
        JwtRequest request = JwtRequest.builder()
                .username("tests")
                .password("wrong-password")
                .build();

        when(manager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authController.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid UserName or Password");
    }

    @Test
    @DisplayName("Register returns a created response with a JWT for the new user")
    void registerReturnsCreatedResponse() {
        RegisterRequest request = RegisterRequest.builder()
                .username("tests")
                .email("tests@example.com")
                .password("secret123")
                .build();
        UserDetails userDetails = User.withUsername("tests")
                .password("encoded-password")
                .roles("USER")
                .build();

        when(userAccountService.register(request)).thenReturn(userDetails);
        when(jwtHelper.generateToken(userDetails)).thenReturn("jwt-token");

        ResponseEntity<JwtResponse> response = authController.register(request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getUsername()).isEqualTo("tests");
        assertThat(response.getBody().getToken()).isEqualTo("jwt-token");
    }

    @Test
    @DisplayName("Get user details returns the authenticated user when the header contains a bearer token")
    void getUserDetailsReturnsAuthenticatedUser() {
        UserDetails userDetails = User.withUsername("tests")
                .password("encoded-password")
                .roles("USER")
                .build();

        when(jwtHelper.getUserNameFromToken("jwt-token")).thenReturn("tests");
        when(userAccountService.loadUserByUsername("tests")).thenReturn(userDetails);

        ResponseEntity<UserDetails> response = authController.getUserDetails("Bearer jwt-token");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(userDetails);
    }

    @Test
    @DisplayName("Get user details rejects missing bearer prefixes")
    void getUserDetailsRejectsInvalidHeader() {
        ResponseEntity<UserDetails> response = authController.getUserDetails("jwt-token");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNull();
    }
}

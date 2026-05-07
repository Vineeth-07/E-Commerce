package com.ecommerce.sportscenter.exceptions;

import com.ecommerce.sportscenter.model.CustomErrorResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.context.request.WebRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class CustomExceptionHandlerTest {

    private final CustomExceptionHandler customExceptionHandler = new CustomExceptionHandler();
    private final WebRequest webRequest = mock(WebRequest.class);

    @Test
    @DisplayName("Duplicate user exceptions are mapped to 409 Conflict")
    void handleUserAlreadyExistsReturnsConflict() {
        ResponseEntity<Object> response = customExceptionHandler.handleUserAlreadyExistsException(
                new UserAlreadyExistsException("Username is already taken"),
                webRequest
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isInstanceOf(CustomErrorResponse.class);

        CustomErrorResponse body = (CustomErrorResponse) response.getBody();
        assertThat(body.getStatus()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(body.getError()).isEqualTo("User already exists");
        assertThat(body.getMessage()).isEqualTo("Username is already taken");
    }

    @Test
    @DisplayName("Invalid registration input is mapped to 400 Bad Request")
    void handleIllegalArgumentReturnsBadRequest() {
        ResponseEntity<Object> response = customExceptionHandler.handleIllegalArgumentException(
                new IllegalArgumentException("Password must be at least 6 characters long"),
                webRequest
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isInstanceOf(CustomErrorResponse.class);

        CustomErrorResponse body = (CustomErrorResponse) response.getBody();
        assertThat(body.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(body.getError()).isEqualTo("Invalid request");
        assertThat(body.getMessage()).isEqualTo("Password must be at least 6 characters long");
    }

    @Test
    @DisplayName("Bad credentials are mapped to 401 Unauthorized")
    void handleBadCredentialsReturnsUnauthorized() {
        ResponseEntity<Object> response = customExceptionHandler.handleBadCredentialsException(
                new BadCredentialsException("Invalid UserName or Password"),
                webRequest
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isInstanceOf(CustomErrorResponse.class);

        CustomErrorResponse body = (CustomErrorResponse) response.getBody();
        assertThat(body.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(body.getError()).isEqualTo("Authentication failed");
        assertThat(body.getMessage()).isEqualTo("Invalid UserName or Password");
    }
}

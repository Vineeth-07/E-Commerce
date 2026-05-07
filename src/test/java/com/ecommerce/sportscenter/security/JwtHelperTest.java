package com.ecommerce.sportscenter.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtHelperTest {

    private final JwtHelper jwtHelper = new JwtHelper();

    @Test
    @DisplayName("Generated tokens round-trip the username and validate for the same user")
    void generateTokenRoundTripsUsername() {
        UserDetails userDetails = User.withUsername("tests")
                .password("encoded-password")
                .roles("USER")
                .build();

        String token = jwtHelper.generateToken(userDetails);

        assertThat(jwtHelper.getUserNameFromToken(token)).isEqualTo("tests");
        assertThat(jwtHelper.validateToken(token, userDetails)).isTrue();
        assertThat(jwtHelper.getExpirationDateFromToken(token)).isAfter(new Date());
    }

    @Test
    @DisplayName("Validation fails when the token belongs to a different user")
    void validateTokenFailsForDifferentUser() {
        UserDetails tokenOwner = User.withUsername("tests")
                .password("encoded-password")
                .roles("USER")
                .build();
        UserDetails otherUser = User.withUsername("other")
                .password("encoded-password")
                .roles("USER")
                .build();

        String token = jwtHelper.generateToken(tokenOwner);

        assertThat(jwtHelper.validateToken(token, otherUser)).isFalse();
    }
}

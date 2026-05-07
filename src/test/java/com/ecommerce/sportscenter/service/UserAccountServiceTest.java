package com.ecommerce.sportscenter.service;

import com.ecommerce.sportscenter.entity.UserAccount;
import com.ecommerce.sportscenter.exceptions.UserAlreadyExistsException;
import com.ecommerce.sportscenter.model.RegisterRequest;
import com.ecommerce.sportscenter.repository.UserAccountRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserAccountServiceTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserAccountService userAccountService;

    @Test
    @DisplayName("Register normalizes fields, encodes password, and assigns USER role")
    void registerNormalizesFieldsAndPersistsUser() {
        RegisterRequest request = RegisterRequest.builder()
                .username("  tests  ")
                .email("  TEST@Example.COM  ")
                .password("  secret123  ")
                .build();

        when(userAccountRepository.existsByUsernameIgnoreCase("tests")).thenReturn(false);
        when(userAccountRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-password");
        when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserDetails userDetails = userAccountService.register(request);

        ArgumentCaptor<UserAccount> savedUserCaptor = ArgumentCaptor.forClass(UserAccount.class);
        verify(userAccountRepository).save(savedUserCaptor.capture());

        UserAccount savedUser = savedUserCaptor.getValue();
        assertThat(savedUser.getUsername()).isEqualTo("tests");
        assertThat(savedUser.getEmail()).isEqualTo("test@example.com");
        assertThat(savedUser.getPassword()).isEqualTo("encoded-password");
        assertThat(savedUser.getRole()).isEqualTo("USER");

        assertThat(userDetails.getUsername()).isEqualTo("tests");
        assertThat(userDetails.getPassword()).isEqualTo("encoded-password");
        assertThat(userDetails.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
    }

    @Test
    @DisplayName("Register rejects duplicate usernames")
    void registerRejectsDuplicateUsername() {
        RegisterRequest request = RegisterRequest.builder()
                .username("tests")
                .email("tests@example.com")
                .password("secret123")
                .build();

        when(userAccountRepository.existsByUsernameIgnoreCase("tests")).thenReturn(true);

        assertThatThrownBy(() -> userAccountService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessage("Username is already taken");

        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }

    @Test
    @DisplayName("Register rejects duplicate emails")
    void registerRejectsDuplicateEmail() {
        RegisterRequest request = RegisterRequest.builder()
                .username("tests")
                .email("tests@example.com")
                .password("secret123")
                .build();

        when(userAccountRepository.existsByUsernameIgnoreCase("tests")).thenReturn(false);
        when(userAccountRepository.existsByEmailIgnoreCase("tests@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userAccountService.register(request))
                .isInstanceOf(UserAlreadyExistsException.class)
                .hasMessage("Email is already in use");

        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }

    @Test
    @DisplayName("Register rejects passwords shorter than six characters")
    void registerRejectsShortPassword() {
        RegisterRequest request = RegisterRequest.builder()
                .username("tests")
                .email("tests@example.com")
                .password("12345")
                .build();

        assertThatThrownBy(() -> userAccountService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Password must be at least 6 characters long");

        verify(userAccountRepository, never()).save(any(UserAccount.class));
    }

    @Test
    @DisplayName("Load user by username returns Spring Security user details")
    void loadUserByUsernameReturnsUserDetails() {
        UserAccount storedUser = UserAccount.builder()
                .username("tests")
                .email("tests@example.com")
                .password("encoded-password")
                .role("ADMIN")
                .build();

        when(userAccountRepository.findByUsernameIgnoreCase("tests")).thenReturn(Optional.of(storedUser));

        UserDetails userDetails = userAccountService.loadUserByUsername("tests");

        assertThat(userDetails.getUsername()).isEqualTo("tests");
        assertThat(userDetails.getPassword()).isEqualTo("encoded-password");
        assertThat(userDetails.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_ADMIN");
    }

    @Test
    @DisplayName("Load user by username throws when the account does not exist")
    void loadUserByUsernameThrowsWhenMissing() {
        when(userAccountRepository.findByUsernameIgnoreCase("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userAccountService.loadUserByUsername("missing"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("User not found");
    }
}

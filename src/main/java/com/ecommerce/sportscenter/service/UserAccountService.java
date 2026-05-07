package com.ecommerce.sportscenter.service;

import com.ecommerce.sportscenter.entity.UserAccount;
import com.ecommerce.sportscenter.exceptions.UserAlreadyExistsException;
import com.ecommerce.sportscenter.model.RegisterRequest;
import com.ecommerce.sportscenter.repository.UserAccountRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class UserAccountService implements UserDetailsService {
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAccountService(UserAccountRepository userAccountRepository, PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserDetails register(RegisterRequest request) {
        String username = normalizeField(request.getUsername());
        String email = normalizeField(request.getEmail()).toLowerCase(Locale.ROOT);
        String password = request.getPassword() == null ? "" : request.getPassword().trim();

        validateRegistrationRequest(username, email, password);

        if (userAccountRepository.existsByUsernameIgnoreCase(username)) {
            throw new UserAlreadyExistsException("Username is already taken");
        }

        if (userAccountRepository.existsByEmailIgnoreCase(email)) {
            throw new UserAlreadyExistsException("Email is already in use");
        }

        UserAccount userAccount = UserAccount.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role("USER")
                .build();

        return toUserDetails(userAccountRepository.save(userAccount));
    }
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount userAccount = userAccountRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return toUserDetails(userAccount);
    }

    private void validateRegistrationRequest(String username, String email, String password) {
        if (username.isBlank()) {
            throw new IllegalArgumentException("Username is required");
        }

        if (email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (password.isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }
    }

    private String normalizeField(String value) {
        return value == null ? "" : value.trim();
    }

    private UserDetails toUserDetails(UserAccount userAccount) {
        return User.builder()
                .username(userAccount.getUsername())
                .password(userAccount.getPassword())
                .roles(userAccount.getRole())
                .build();
    }
}

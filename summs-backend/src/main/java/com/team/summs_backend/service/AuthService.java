package com.team.summs_backend.service;

import java.util.Locale;
import java.util.regex.Pattern;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.team.summs_backend.dto.AuthResponse;
import com.team.summs_backend.dto.LoginRequest;
import com.team.summs_backend.dto.SignupRequest;
import com.team.summs_backend.model.AppUser;
import com.team.summs_backend.repository.AppUserRepository;

@Service
public class AuthService {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("[A-Za-z0-9._-]{3,20}");

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse signup(SignupRequest request) {
        String email = normalizeAndValidateEmail(request.email());
        String username = normalizeAndValidateUsername(request.username());
        validatePassword(request.password());

        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        AppUser appUser = new AppUser();
        appUser.setEmail(email);
        appUser.setUsername(username);
        appUser.setPasswordHash(passwordEncoder.encode(request.password()));

        try {
            AppUser saved = appUserRepository.save(appUser);
            return new AuthResponse(saved.getId(), saved.getEmail(), saved.getUsername(), "Signup successful");
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered", ex);
        }
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeAndValidateEmail(request.email());

        AppUser appUser = appUserRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect email or password"));

        if (!passwordEncoder.matches(request.password(), appUser.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect email or password");
        }

        return new AuthResponse(appUser.getId(), appUser.getEmail(), appUser.getUsername(), "Login successful");
    }

    private static String normalizeAndValidateEmail(String rawEmail) {
        if (rawEmail == null || rawEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        if (!email.contains("@") || email.length() < 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid email address");
        }
        return email;
    }

    private static String normalizeAndValidateUsername(String rawUsername) {
        if (rawUsername == null || rawUsername.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is required");
        }

        String username = rawUsername.trim();
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Username must be 3 to 20 characters and contain only letters, numbers, periods, underscores, or hyphens"
            );
        }

        return username;
    }

    private static void validatePassword(String password) {
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        if (password.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters long");
        }
    }
}

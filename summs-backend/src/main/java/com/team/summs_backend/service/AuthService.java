package com.team.summs_backend.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.team.summs_backend.dto.AuthResponse;
import com.team.summs_backend.dto.LoginRequest;
import com.team.summs_backend.dto.SignupRequest;
import com.team.summs_backend.model.AccountType;
import com.team.summs_backend.model.AppUser;
import com.team.summs_backend.model.MobilityProvider;
import com.team.summs_backend.repository.AppUserRepository;
import com.team.summs_backend.repository.MobilityProviderRepository;

@Service
public class AuthService {

    private static final Pattern USERNAME_PATTERN = Pattern.compile("[A-Za-z0-9._-]{3,20}");
    private static final Set<String> ALLOWED_MOBILITY_OPTIONS = Set.of("Scooter", "Bike", "Car");

    private final AppUserRepository appUserRepository;
    private final MobilityProviderRepository mobilityProviderRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
        AppUserRepository appUserRepository,
        MobilityProviderRepository mobilityProviderRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.mobilityProviderRepository = mobilityProviderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse signup(SignupRequest request) {
        String email = normalizeAndValidateEmail(request.email());
        String username = normalizeAndValidateUsername(request.username());
        AccountType accountType = normalizeAndValidateAccountType(request.accountType());
        validatePassword(request.password());

        if (emailExists(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        String passwordHash = passwordEncoder.encode(request.password());

        try {
            return switch (accountType) {
                case USER -> signupUser(email, username, passwordHash, request.mobilityOptions());
                case MOBILITY_PROVIDER -> signupMobilityProvider(email, username, passwordHash, request.mobilityOptions());
            };
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered", ex);
        }
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeAndValidateEmail(request.email());

        AppUser appUser = appUserRepository.findByEmailIgnoreCase(email).orElse(null);
        if (appUser != null) {
            validatePasswordMatch(request.password(), appUser.getPasswordHash());
            return new AuthResponse(appUser.getId(), appUser.getEmail(), appUser.getUsername(), "Login successful");
        }

        MobilityProvider mobilityProvider = mobilityProviderRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect email or password"));

        validatePasswordMatch(request.password(), mobilityProvider.getPasswordHash());

        return new AuthResponse(
            mobilityProvider.getId(),
            mobilityProvider.getEmail(),
            mobilityProvider.getUsername(),
            "Login successful"
        );
    }

    private AuthResponse signupUser(String email, String username, String passwordHash, List<String> rawMobilityOptions) {
        if (rawMobilityOptions != null && !rawMobilityOptions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobility options are only allowed for mobility providers");
        }

        AppUser appUser = new AppUser();
        appUser.setEmail(email);
        appUser.setUsername(username);
        appUser.setPasswordHash(passwordHash);

        AppUser saved = appUserRepository.save(appUser);
        return new AuthResponse(saved.getId(), saved.getEmail(), saved.getUsername(), "Signup successful");
    }

    private AuthResponse signupMobilityProvider(
        String email,
        String username,
        String passwordHash,
        List<String> rawMobilityOptions
    ) {
        MobilityProvider mobilityProvider = new MobilityProvider();
        mobilityProvider.setEmail(email);
        mobilityProvider.setUsername(username);
        mobilityProvider.setPasswordHash(passwordHash);
        mobilityProvider.setMobilityOptions(normalizeAndValidateMobilityOptions(rawMobilityOptions));

        MobilityProvider saved = mobilityProviderRepository.save(mobilityProvider);
        return new AuthResponse(saved.getId(), saved.getEmail(), saved.getUsername(), "Signup successful");
    }

    private boolean emailExists(String email) {
        return appUserRepository.existsByEmailIgnoreCase(email) || mobilityProviderRepository.existsByEmailIgnoreCase(email);
    }

    private void validatePasswordMatch(String rawPassword, String storedPasswordHash) {
        if (!passwordEncoder.matches(rawPassword, storedPasswordHash)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect email or password");
        }
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

    private static AccountType normalizeAndValidateAccountType(String rawAccountType) {
        if (rawAccountType == null || rawAccountType.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account type is required");
        }

        String accountType = rawAccountType.trim().toLowerCase(Locale.ROOT);
        return switch (accountType) {
            case "user" -> AccountType.USER;
            case "provider" -> AccountType.MOBILITY_PROVIDER;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account type must be user or provider");
        };
    }

    private static String normalizeAndValidateMobilityOptions(List<String> rawMobilityOptions) {
        if (rawMobilityOptions == null || rawMobilityOptions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select at least one mobility option");
        }

        LinkedHashSet<String> normalizedOptions = new LinkedHashSet<>();
        for (String rawOption : rawMobilityOptions) {
            if (rawOption == null) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mobility options must only include Scooter, Bike, or Car"
                );
            }

            String option = rawOption.trim();
            if (!ALLOWED_MOBILITY_OPTIONS.contains(option)) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mobility options must only include Scooter, Bike, or Car"
                );
            }

            normalizedOptions.add(option);
        }

        if (normalizedOptions.isEmpty()) {
            return null;
        }

        return String.join(",", normalizedOptions);
    }
}

package com.team.summs_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import com.team.summs_backend.dto.AuthResponse;
import com.team.summs_backend.dto.LoginRequest;
import com.team.summs_backend.dto.SignupRequest;
import com.team.summs_backend.model.AppUser;
import com.team.summs_backend.model.MobilityProvider;
import com.team.summs_backend.repository.AppUserRepository;
import com.team.summs_backend.repository.MobilityProviderRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private MobilityProviderRepository mobilityProviderRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest("user@example.com", "12345678", "valid.user", "provider", List.of("Scooter", "Bike"));
        loginRequest = new LoginRequest("user@example.com", "12345678");
    }

    @Test
    void signupShouldCreateMobilityProviderWhenEmailIsAvailable() {
        MobilityProvider savedProvider = new MobilityProvider();
        savedProvider.setId(7L);
        savedProvider.setEmail("user@example.com");
        savedProvider.setUsername("valid.user");

        when(appUserRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(mobilityProviderRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("12345678")).thenReturn("hashed-password");
        when(mobilityProviderRepository.save(any(MobilityProvider.class))).thenReturn(savedProvider);

        AuthResponse response = authService.signup(signupRequest);

        assertEquals(7L, response.userId());
        assertEquals("user@example.com", response.email());
        assertEquals("valid.user", response.username());
        assertEquals("Signup successful", response.message());
        verify(mobilityProviderRepository).save(argThat(provider ->
            "user@example.com".equals(provider.getEmail())
                && "valid.user".equals(provider.getUsername())
                && "hashed-password".equals(provider.getPasswordHash())
                && "Scooter,Bike".equals(provider.getMobilityOptions())
        ));
    }

    @Test
    void signupShouldCreateUserWithoutMobilityOptionsWhenSigningUpAsUser() {
        SignupRequest requestWithoutMobilityOptions = new SignupRequest("user@example.com", "12345678", "valid.user", "user", null);
        AppUser savedUser = new AppUser();
        savedUser.setId(8L);
        savedUser.setEmail("user@example.com");
        savedUser.setUsername("valid.user");

        when(appUserRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(mobilityProviderRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("12345678")).thenReturn("hashed-password");
        when(appUserRepository.save(any(AppUser.class))).thenReturn(savedUser);

        authService.signup(requestWithoutMobilityOptions);

        verify(appUserRepository).save(argThat(user -> user.getEmail().equals("user@example.com") && user.getPasswordHash().equals("hashed-password")));
    }

    @Test
    void signupShouldThrowBadRequestWhenMobilityOptionsContainInvalidValue() {
        SignupRequest invalidRequest = new SignupRequest(
            "user@example.com",
            "12345678",
            "valid.user",
            "provider",
            List.of("Scooter", "Train")
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Mobility options must only include Scooter, Bike, or Car", ex.getReason());
    }

    @Test
    void signupShouldThrowBadRequestWhenProviderHasNoMobilityOptions() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "valid.user", "provider", List.of());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Select at least one mobility option", ex.getReason());
    }

    @Test
    void signupShouldThrowBadRequestWhenUserIncludesMobilityOptions() {
        SignupRequest invalidRequest = new SignupRequest(
            "user@example.com",
            "12345678",
            "valid.user",
            "user",
            List.of("Scooter")
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Mobility options are only allowed for mobility providers", ex.getReason());
    }

    @Test
    void signupShouldThrowConflictWhenEmailAlreadyExists() {
        when(appUserRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(signupRequest));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Email is already registered", ex.getReason());
    }

    @Test
    void signupShouldThrowConflictWhenDatabaseUniqueConstraintFails() {
        when(appUserRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(mobilityProviderRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("12345678")).thenReturn("hashed-password");
        when(mobilityProviderRepository.save(any(MobilityProvider.class))).thenThrow(new DataIntegrityViolationException("duplicate"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(signupRequest));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Email is already registered", ex.getReason());
    }

    @Test
    void signupShouldThrowBadRequestWhenUsernameIsBlank() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "   ", "user", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Username is required", ex.getReason());
    }

    @Test
    void signupShouldThrowBadRequestWhenUsernameHasInvalidCharacters() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "bad name!", "user", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals(
            "Username must be 3 to 20 characters and contain only letters, numbers, periods, underscores, or hyphens",
            ex.getReason()
        );
    }

    @Test
    void signupShouldThrowBadRequestWhenUsernameIsTooShort() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "ab", "user", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals(
            "Username must be 3 to 20 characters and contain only letters, numbers, periods, underscores, or hyphens",
            ex.getReason()
        );
    }

    @Test
    void signupShouldThrowBadRequestWhenUsernameIsTooLong() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "abcdefghijklmnopqrstu", "user", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals(
            "Username must be 3 to 20 characters and contain only letters, numbers, periods, underscores, or hyphens",
            ex.getReason()
        );
    }

    @Test
    void signupShouldThrowBadRequestWhenAccountTypeIsMissing() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "valid.user", "   ", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Account type is required", ex.getReason());
    }

    @Test
    void loginShouldReturnUserWhenCredentialsAreValid() {
        AppUser existingUser = new AppUser();
        existingUser.setId(3L);
        existingUser.setEmail("user@example.com");
        existingUser.setUsername("valid.user");
        existingUser.setPasswordHash("stored-hash");

        when(appUserRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("12345678", "stored-hash")).thenReturn(true);

        AuthResponse response = authService.login(loginRequest);

        assertEquals(3L, response.userId());
        assertEquals("user@example.com", response.email());
        assertEquals("valid.user", response.username());
        assertEquals("Login successful", response.message());
    }

    @Test
    void loginShouldThrowUnauthorizedWhenEmailDoesNotExist() {
        when(appUserRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.empty());
        when(mobilityProviderRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.login(loginRequest));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Incorrect email or password", ex.getReason());
    }

    @Test
    void loginShouldThrowUnauthorizedWhenPasswordIsWrong() {
        AppUser existingUser = new AppUser();
        existingUser.setEmail("user@example.com");
        existingUser.setUsername("valid.user");
        existingUser.setPasswordHash("stored-hash");

        when(appUserRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("12345678", "stored-hash")).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.login(loginRequest));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Incorrect email or password", ex.getReason());
    }

    @Test
    void loginShouldReturnProviderWhenCredentialsAreValid() {
        MobilityProvider existingProvider = new MobilityProvider();
        existingProvider.setId(11L);
        existingProvider.setEmail("user@example.com");
        existingProvider.setUsername("valid.user");
        existingProvider.setPasswordHash("stored-hash");

        when(appUserRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.empty());
        when(mobilityProviderRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(existingProvider));
        when(passwordEncoder.matches("12345678", "stored-hash")).thenReturn(true);

        AuthResponse response = authService.login(loginRequest);

        assertEquals(11L, response.userId());
        assertEquals("user@example.com", response.email());
        assertEquals("valid.user", response.username());
    }
}

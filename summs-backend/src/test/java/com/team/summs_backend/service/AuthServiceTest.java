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
import com.team.summs_backend.repository.AppUserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        signupRequest = new SignupRequest("user@example.com", "12345678", "valid.user", List.of("Scooter", "Bike"));
        loginRequest = new LoginRequest("user@example.com", "12345678");
    }

    @Test
    void signupShouldCreateUserWhenEmailIsAvailable() {
        AppUser savedUser = new AppUser();
        savedUser.setId(7L);
        savedUser.setEmail("user@example.com");
        savedUser.setUsername("valid.user");

        when(appUserRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("12345678")).thenReturn("hashed-password");
        when(appUserRepository.save(any(AppUser.class))).thenReturn(savedUser);

        AuthResponse response = authService.signup(signupRequest);

        assertEquals(7L, response.userId());
        assertEquals("user@example.com", response.email());
        assertEquals("valid.user", response.username());
        assertEquals("Signup successful", response.message());
        verify(appUserRepository).save(argThat(user ->
            "user@example.com".equals(user.getEmail())
                && "valid.user".equals(user.getUsername())
                && "hashed-password".equals(user.getPasswordHash())
                && "Scooter,Bike".equals(user.getMobilityOptions())
        ));
    }

    @Test
    void signupShouldCreateUserWithNullMobilityOptionsWhenNotProvided() {
        SignupRequest requestWithoutMobilityOptions = new SignupRequest("user@example.com", "12345678", "valid.user", null);
        AppUser savedUser = new AppUser();
        savedUser.setId(8L);
        savedUser.setEmail("user@example.com");
        savedUser.setUsername("valid.user");

        when(appUserRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("12345678")).thenReturn("hashed-password");
        when(appUserRepository.save(any(AppUser.class))).thenReturn(savedUser);

        authService.signup(requestWithoutMobilityOptions);

        verify(appUserRepository).save(argThat(user -> user.getMobilityOptions() == null));
    }

    @Test
    void signupShouldThrowBadRequestWhenMobilityOptionsContainInvalidValue() {
        SignupRequest invalidRequest = new SignupRequest(
            "user@example.com",
            "12345678",
            "valid.user",
            List.of("Scooter", "Train")
        );

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Mobility options must only include Scooter, Bike, or Car", ex.getReason());
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
        when(passwordEncoder.encode("12345678")).thenReturn("hashed-password");
        when(appUserRepository.save(any(AppUser.class))).thenThrow(new DataIntegrityViolationException("duplicate"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(signupRequest));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Email is already registered", ex.getReason());
    }

    @Test
    void signupShouldThrowBadRequestWhenUsernameIsBlank() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "   ", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Username is required", ex.getReason());
    }

    @Test
    void signupShouldThrowBadRequestWhenUsernameHasInvalidCharacters() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "bad name!", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals(
            "Username must be 3 to 20 characters and contain only letters, numbers, periods, underscores, or hyphens",
            ex.getReason()
        );
    }

    @Test
    void signupShouldThrowBadRequestWhenUsernameIsTooShort() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "ab", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals(
            "Username must be 3 to 20 characters and contain only letters, numbers, periods, underscores, or hyphens",
            ex.getReason()
        );
    }

    @Test
    void signupShouldThrowBadRequestWhenUsernameIsTooLong() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "abcdefghijklmnopqrstu", null);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authService.signup(invalidRequest));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals(
            "Username must be 3 to 20 characters and contain only letters, numbers, periods, underscores, or hyphens",
            ex.getReason()
        );
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
}

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
import org.springframework.security.crypto.password.PasswordEncoder;

import com.team.summs_backend.dto.AuthResponse;
import com.team.summs_backend.dto.LoginRequest;
import com.team.summs_backend.dto.SignupRequest;
import com.team.summs_backend.exception.EmailAlreadyRegisteredException;
import com.team.summs_backend.exception.InvalidCredentialsException;
import com.team.summs_backend.exception.InvalidInputException;
import com.team.summs_backend.model.AppUser;
import com.team.summs_backend.model.MobilityProvider;
import com.team.summs_backend.repository.AdminUserRepository;
import com.team.summs_backend.repository.AppUserRepository;
import com.team.summs_backend.repository.MobilityProviderRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private MobilityProviderRepository mobilityProviderRepository;

    @Mock
    private AdminUserRepository adminUserRepository;

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
        assertEquals("MOBILITY_PROVIDER", response.accountType());
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
    void signupShouldThrowWhenMobilityOptionsContainInvalidValue() {
        SignupRequest invalidRequest = new SignupRequest(
            "user@example.com",
            "12345678",
            "valid.user",
            "provider",
            List.of("Scooter", "Train")
        );

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> authService.signup(invalidRequest));
        assertEquals("Mobility options must only include Scooter, Bike, or Car", ex.getMessage());
    }

    @Test
    void signupShouldThrowWhenProviderHasNoMobilityOptions() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "valid.user", "provider", List.of());

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> authService.signup(invalidRequest));
        assertEquals("Select at least one mobility option", ex.getMessage());
    }

    @Test
    void signupShouldThrowWhenUserIncludesMobilityOptions() {
        SignupRequest invalidRequest = new SignupRequest(
            "user@example.com",
            "12345678",
            "valid.user",
            "user",
            List.of("Scooter")
        );

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> authService.signup(invalidRequest));
        assertEquals("Mobility options are only allowed for mobility providers", ex.getMessage());
    }

    @Test
    void signupShouldThrowWhenEmailAlreadyExists() {
        when(appUserRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(true);

        EmailAlreadyRegisteredException ex = assertThrows(EmailAlreadyRegisteredException.class, () -> authService.signup(signupRequest));
        assertEquals("Email is already registered", ex.getMessage());
    }

    @Test
    void signupShouldThrowWhenDatabaseUniqueConstraintFails() {
        when(appUserRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(mobilityProviderRepository.existsByEmailIgnoreCase("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("12345678")).thenReturn("hashed-password");
        when(mobilityProviderRepository.save(any(MobilityProvider.class))).thenThrow(new DataIntegrityViolationException("duplicate"));

        EmailAlreadyRegisteredException ex = assertThrows(EmailAlreadyRegisteredException.class, () -> authService.signup(signupRequest));
        assertEquals("Email is already registered", ex.getMessage());
    }

    @Test
    void signupShouldThrowWhenUsernameIsBlank() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "   ", "user", null);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> authService.signup(invalidRequest));
        assertEquals("Username is required", ex.getMessage());
    }

    @Test
    void signupShouldThrowWhenUsernameHasInvalidCharacters() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "bad name!", "user", null);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> authService.signup(invalidRequest));
        assertEquals(
            "Username must be 3 to 20 characters and contain only letters, numbers, periods, underscores, or hyphens",
            ex.getMessage()
        );
    }

    @Test
    void signupShouldThrowWhenUsernameIsTooShort() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "ab", "user", null);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> authService.signup(invalidRequest));
        assertEquals(
            "Username must be 3 to 20 characters and contain only letters, numbers, periods, underscores, or hyphens",
            ex.getMessage()
        );
    }

    @Test
    void signupShouldThrowWhenUsernameIsTooLong() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "abcdefghijklmnopqrstu", "user", null);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> authService.signup(invalidRequest));
        assertEquals(
            "Username must be 3 to 20 characters and contain only letters, numbers, periods, underscores, or hyphens",
            ex.getMessage()
        );
    }

    @Test
    void signupShouldThrowWhenAccountTypeIsMissing() {
        SignupRequest invalidRequest = new SignupRequest("user@example.com", "12345678", "valid.user", "   ", null);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> authService.signup(invalidRequest));
        assertEquals("Account type is required", ex.getMessage());
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
        assertEquals("USER", response.accountType());
        assertEquals("Login successful", response.message());
    }

    @Test
    void loginShouldThrowWhenEmailDoesNotExist() {
        when(appUserRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.empty());
        when(mobilityProviderRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.empty());

        InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> authService.login(loginRequest));
        assertEquals("Incorrect email or password", ex.getMessage());
    }

    @Test
    void loginShouldThrowWhenPasswordIsWrong() {
        AppUser existingUser = new AppUser();
        existingUser.setEmail("user@example.com");
        existingUser.setUsername("valid.user");
        existingUser.setPasswordHash("stored-hash");

        when(appUserRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("12345678", "stored-hash")).thenReturn(false);

        InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> authService.login(loginRequest));
        assertEquals("Incorrect email or password", ex.getMessage());
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
        assertEquals("MOBILITY_PROVIDER", response.accountType());
    }
}

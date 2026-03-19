package com.team.summs_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.team.summs_backend.dto.AuthResponse;
import com.team.summs_backend.dto.LoginRequest;
import com.team.summs_backend.dto.SignupRequest;
import com.team.summs_backend.exception.EmailAlreadyRegisteredException;
import com.team.summs_backend.exception.InvalidCredentialsException;
import com.team.summs_backend.service.AuthService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void signupShouldReturnCreatedWhenSignupSucceeds() {
        SignupRequest request = new SignupRequest("user@example.com", "12345678", "valid.user", "provider", List.of("Scooter"));
        AuthResponse serviceResponse = new AuthResponse(10L, "user@example.com", "valid.user", "MOBILITY_PROVIDER", "Signup successful");

        when(authService.signup(request)).thenReturn(serviceResponse);

        ResponseEntity<AuthResponse> response = authController.signup(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("valid.user", response.getBody().username());
        assertEquals("Signup successful", response.getBody().message());
    }

    @Test
    void signupShouldThrowWhenEmailAlreadyExists() {
        SignupRequest request = new SignupRequest("user@example.com", "12345678", "valid.user", "user", null);

        when(authService.signup(request))
            .thenThrow(new EmailAlreadyRegisteredException("Email is already registered"));

        EmailAlreadyRegisteredException ex = assertThrows(EmailAlreadyRegisteredException.class, () -> authController.signup(request));
        assertEquals("Email is already registered", ex.getMessage());
    }

    @Test
    void loginShouldThrowWhenCredentialsAreInvalid() {
        LoginRequest request = new LoginRequest("user@example.com", "wrong-password");

        when(authService.login(request))
            .thenThrow(new InvalidCredentialsException("Incorrect email or password"));

        InvalidCredentialsException ex = assertThrows(InvalidCredentialsException.class, () -> authController.login(request));
        assertEquals("Incorrect email or password", ex.getMessage());
    }

    @Test
    void loginShouldReturnOkWhenCredentialsAreValid() {
        LoginRequest request = new LoginRequest("user@example.com", "12345678");
        AuthResponse serviceResponse = new AuthResponse(4L, "user@example.com", "valid.user", "USER", "Login successful");

        when(authService.login(request)).thenReturn(serviceResponse);

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("valid.user", response.getBody().username());
        assertEquals("Login successful", response.getBody().message());
    }
}

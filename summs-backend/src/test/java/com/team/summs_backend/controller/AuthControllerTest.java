package com.team.summs_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;

import com.team.summs_backend.dto.AuthResponse;
import com.team.summs_backend.dto.LoginRequest;
import com.team.summs_backend.dto.SignupRequest;
import com.team.summs_backend.service.AuthService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void signupShouldReturnCreatedWhenSignupSucceeds() {
        SignupRequest request = new SignupRequest("user@example.com", "12345678");
        AuthResponse serviceResponse = new AuthResponse(10L, "user@example.com", "Signup successful");

        when(authService.signup(request)).thenReturn(serviceResponse);

        ResponseEntity<AuthResponse> response = authController.signup(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Signup successful", response.getBody().message());
    }

    @Test
    void signupShouldReturnConflictWhenEmailAlreadyExists() {
        SignupRequest request = new SignupRequest("user@example.com", "12345678");

        when(authService.signup(request))
            .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authController.signup(request));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        assertEquals("Email is already registered", ex.getReason());
    }

    @Test
    void loginShouldReturnUnauthorizedWhenCredentialsAreInvalid() {
        LoginRequest request = new LoginRequest("user@example.com", "wrong-password");

        when(authService.login(request))
            .thenThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Incorrect email or password"));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> authController.login(request));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        assertEquals("Incorrect email or password", ex.getReason());
    }

    @Test
    void loginShouldReturnOkWhenCredentialsAreValid() {
        LoginRequest request = new LoginRequest("user@example.com", "12345678");
        AuthResponse serviceResponse = new AuthResponse(4L, "user@example.com", "Login successful");

        when(authService.login(request)).thenReturn(serviceResponse);

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Login successful", response.getBody().message());
    }
}

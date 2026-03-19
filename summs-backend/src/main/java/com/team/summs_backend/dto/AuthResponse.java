package com.team.summs_backend.dto;

public record AuthResponse(Long userId, String email, String username, String accountType, String message) {
}

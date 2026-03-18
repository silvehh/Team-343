package com.team.summs_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Error response")
public record ErrorResponse(
    @Schema(description = "Error message", example = "Email is already registered")
    String message
) {}

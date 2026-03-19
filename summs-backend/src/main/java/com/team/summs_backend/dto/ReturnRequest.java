package com.team.summs_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request to return a rented vehicle")
public record ReturnRequest(
    Long userId,
    Long stationId
) {}

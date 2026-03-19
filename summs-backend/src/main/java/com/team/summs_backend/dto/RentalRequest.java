package com.team.summs_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request to rent a vehicle")
public record RentalRequest(
    Long userId,
    Long vehicleId
) {}

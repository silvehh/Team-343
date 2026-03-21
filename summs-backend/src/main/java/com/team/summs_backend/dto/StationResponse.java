package com.team.summs_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Station with capacity and live vehicle counts")
public record StationResponse(
    Long id,
    String name,
    double latitude,
    double longitude,
    int carCapacity,
    int bikeCapacity,
    int scooterCapacity,
    @Schema(description = "Number of available cars at this station")
    long availableCars,
    @Schema(description = "Number of available bikes at this station")
    long availableBikes,
    @Schema(description = "Number of available scooters at this station")
    long availableScooters
) {}

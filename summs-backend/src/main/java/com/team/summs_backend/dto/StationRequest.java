package com.team.summs_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request to create or update a station")
public record StationRequest(
    String name,
    double latitude,
    double longitude,
    int carCapacity,
    int bikeCapacity,
    int scooterCapacity
) {}

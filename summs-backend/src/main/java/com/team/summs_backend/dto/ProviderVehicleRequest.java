package com.team.summs_backend.dto;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request to add or update a vehicle by a mobility provider")
public record ProviderVehicleRequest(
    @Schema(description = "Vehicle type: CAR, BIKE, or SCOOTER")
    String vehicleType,

    @Schema(description = "Station ID where the vehicle will be placed")
    Long stationId,

    @Schema(description = "Price per hour for renting this vehicle")
    BigDecimal pricePerHour
) {}

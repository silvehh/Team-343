package com.team.summs_backend.dto;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Available vehicle details")
public record VehicleResponse(
    Long id,
    String vehicleType,
    String providerName,
    Long providerId,
    BigDecimal pricePerHour,
    Long stationId,
    String stationName
) {}

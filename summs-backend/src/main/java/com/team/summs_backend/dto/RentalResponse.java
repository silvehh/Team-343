package com.team.summs_backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Rental details")
public record RentalResponse(
    Long id,
    Long vehicleId,
    String vehicleType,
    String providerName,
    String status,
    LocalDateTime startTime,
    LocalDateTime endTime,
    BigDecimal totalCost,
    String pickupStationName,
    String returnStationName
) {}

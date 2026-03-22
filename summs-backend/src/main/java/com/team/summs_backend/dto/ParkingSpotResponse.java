package com.team.summs_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Parking spot details")
public class ParkingSpotResponse {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String parkingType;
    private Integer totalSpots;
    private Integer availableSpots;
    private Double pricePerHour;
    private String status;
    private String operatingHours;
    private Boolean hasEvCharging;
    private Boolean hasDisabledAccess;
}

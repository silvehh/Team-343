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
@Schema(description = "Transit route details")
public class TransitRouteResponse {
    private Long id;
    private String routeNumber;
    private String routeName;
    private String transitType;
    private String startStation;
    private String endStation;
    private Integer frequencyMinutes;
    private Integer currentDelayMinutes;
    private Integer currentCapacityPercent;
    private Integer reliabilityScore;
    private String operatingHours;
    private Boolean isActive;
}

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
@Schema(description = "Transit stop details")
public class TransitStopResponse {
    private Long id;
    private String name;
    private Double latitude;
    private Double longitude;
    private Long routeId;
    private String routeNumber;
    private Integer stopOrder;
    private String nextArrival;
}

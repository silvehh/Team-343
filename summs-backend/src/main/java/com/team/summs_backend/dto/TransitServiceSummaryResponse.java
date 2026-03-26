package com.team.summs_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransitServiceSummaryResponse {
  private long activeRoutes;
  private long delayedRoutes;
  private double averageDelayMinutes;
  /**
   * 0-100
   */
  private double averageCapacityPercent;
}

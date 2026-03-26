package com.team.summs_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ParkingUtilizationResponse {
  private String city;
  private int totalSpots;
  private int availableSpots;
  /**
   * 0-100
   */
  private double utilizationPercent;
}

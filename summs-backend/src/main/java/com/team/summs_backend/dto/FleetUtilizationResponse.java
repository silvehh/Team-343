package com.team.summs_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FleetUtilizationResponse {
  /** Total number of vehicles owned by the provider. */
  private long totalVehicles;

  /** Number of vehicles currently available for rental. */
  private long availableVehicles;

  /** Number of vehicles currently rented out. */
  private long rentedVehicles;

  /** Availability rate as a percentage (0-100). */
  private double availabilityRate;

  /** Count of available cars. */
  private long availableCars;

  /** Count of available bikes. */
  private long availableBikes;

  /** Count of available scooters. */
  private long availableScooters;

  /** Count of rented cars. */
  private long rentedCars;

  /** Count of rented bikes. */
  private long rentedBikes;

  /** Count of rented scooters. */
  private long rentedScooters;
}

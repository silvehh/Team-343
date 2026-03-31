package com.team.summs_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RentalActivityResponse {
  /** Total number of completed rentals. */
  private long completedRentals;

  /** Total number of currently active rentals. */
  private long activeRentals;

  /** Number of completed car rentals. */
  private long completedCarRentals;

  /** Number of completed bike rentals. */
  private long completedBikeRentals;

  /** Number of completed scooter rentals. */
  private long completedScooterRentals;

  /** Average rental duration in minutes. */
  private double averageRentalDurationMinutes;

  /** Usage ratio (bike rentals / scooter rentals). 0 when scooter rentals is 0. */
  private double bikeToScooterRatioIfMultiType;
}

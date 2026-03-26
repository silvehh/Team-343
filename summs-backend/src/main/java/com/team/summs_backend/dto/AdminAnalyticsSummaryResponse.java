package com.team.summs_backend.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsSummaryResponse {
  private long totalRegisteredUsers;
  private long completedTrips;

  /** Rental counts grouped by vehicle type (cars/bikes/scooters). */
  private VehicleUsageResponse rentalVehicleUsage;

  /**
   * Usage comparison (bike rentals / scooter rentals). 0 when scooter rentals is
   * 0.
   */
  private double bikeToScooterUsageRatio;

  /** Active rentals grouped by a derived "city" label. */
  private List<CityCountResponse> activeRentalsByCity;

  /** Parking utilization grouped by a derived "city" label. */
  private List<ParkingUtilizationResponse> parkingUtilizationByCity;

  /** Delay + capacity summary for active transit routes. */
  private TransitServiceSummaryResponse transitServiceSummary;

  private LocalDateTime generatedAt;
}

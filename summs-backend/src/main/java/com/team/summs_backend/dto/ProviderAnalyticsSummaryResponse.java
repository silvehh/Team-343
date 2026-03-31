package com.team.summs_backend.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProviderAnalyticsSummaryResponse {
  /** Revenue breakdown by vehicle type. */
  private RevenueResponse revenue;

  /** Fleet utilization and availability metrics. */
  private FleetUtilizationResponse fleetUtilization;

  /** Rental activity and usage statistics. */
  private RentalActivityResponse rentalActivity;

  /** Profitability and efficiency metrics. */
  private EfficiencyMetricsResponse efficiencyMetrics;

  /** Timestamp when this analytics snapshot was generated. */
  private LocalDateTime generatedAt;
}

package com.team.summs_backend.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RevenueResponse {
  /** Total revenue from all completed rentals. */
  private BigDecimal totalRevenue;

  /** Revenue from car rentals. */
  private BigDecimal carRevenue;

  /** Revenue from bike rentals. */
  private BigDecimal bikeRevenue;

  /** Revenue from scooter rentals. */
  private BigDecimal scooterRevenue;
}

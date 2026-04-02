package com.team.summs_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.summs_backend.dto.ProviderAnalyticsSummaryResponse;
import com.team.summs_backend.exception.UnauthorizedException;
import com.team.summs_backend.service.ProviderAnalyticsService;

@RestController
@RequestMapping("/api/provider/analytics")
public class ProviderAnalyticsController {

  private final ProviderAnalyticsService providerAnalyticsService;

  public ProviderAnalyticsController(ProviderAnalyticsService providerAnalyticsService) {
    this.providerAnalyticsService = providerAnalyticsService;
  }

  @GetMapping("/summary")
  public ResponseEntity<ProviderAnalyticsSummaryResponse> getSummary(
      @RequestHeader("X-Account-Type") String accountType,
      @RequestHeader("X-User-Id") Long providerId) {
    requireProvider(accountType);
    return ResponseEntity.ok(providerAnalyticsService.getSummary(providerId));
  }

  private void requireProvider(String accountType) {
    if (!"MOBILITY_PROVIDER".equalsIgnoreCase(accountType)) {
      throw new UnauthorizedException("This resource requires MOBILITY_PROVIDER account type");
    }
  }
}

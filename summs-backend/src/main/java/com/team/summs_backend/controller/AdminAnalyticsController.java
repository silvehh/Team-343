package com.team.summs_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.summs_backend.dto.AdminAnalyticsSummaryResponse;
import com.team.summs_backend.exception.UnauthorizedException;
import com.team.summs_backend.service.AdminAnalyticsService;

@RestController
@RequestMapping("/api/admin/analytics")
public class AdminAnalyticsController {

  private final AdminAnalyticsService adminAnalyticsService;

  public AdminAnalyticsController(AdminAnalyticsService adminAnalyticsService) {
    this.adminAnalyticsService = adminAnalyticsService;
  }

  @GetMapping("/summary")
  public ResponseEntity<AdminAnalyticsSummaryResponse> getSummary(
      @RequestHeader("X-Account-Type") String accountType) {
    requireAdmin(accountType);
    return ResponseEntity.ok(adminAnalyticsService.getSummary());
  }

  private void requireAdmin(String accountType) {
    if (!"ADMIN".equalsIgnoreCase(accountType)) {
      throw new UnauthorizedException("Admin access required");
    }
  }
}

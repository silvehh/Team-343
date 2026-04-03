package com.team.summs_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.team.summs_backend.dto.EfficiencyMetricsResponse;
import com.team.summs_backend.dto.FleetUtilizationResponse;
import com.team.summs_backend.dto.ProviderAnalyticsSummaryResponse;
import com.team.summs_backend.dto.RentalActivityResponse;
import com.team.summs_backend.dto.RevenueResponse;
import com.team.summs_backend.exception.UnauthorizedException;
import com.team.summs_backend.service.ProviderAnalyticsService;

@ExtendWith(MockitoExtension.class)
class ProviderAnalyticsControllerTest {

    @Mock
    private ProviderAnalyticsService providerAnalyticsService;

    @InjectMocks
    private ProviderAnalyticsController providerAnalyticsController;

    @Test
    void getSummaryShouldReturnOkForProvider() {
        ProviderAnalyticsSummaryResponse serviceResponse = new ProviderAnalyticsSummaryResponse(
            new RevenueResponse(BigDecimal.valueOf(100), BigDecimal.valueOf(50), BigDecimal.valueOf(30), BigDecimal.valueOf(20)),
            new FleetUtilizationResponse(10, 7, 3, 70.0, 3, 2, 2, 1, 1, 1),
            new RentalActivityResponse(5, 2, 2, 2, 1, 90.0, 2.0),
            new EfficiencyMetricsResponse(BigDecimal.valueOf(20), BigDecimal.valueOf(25), BigDecimal.valueOf(15), BigDecimal.valueOf(20), BigDecimal.valueOf(10), 0.5, 50.0, 30.0, 20.0),
            LocalDateTime.now());

        when(providerAnalyticsService.getSummary(1L)).thenReturn(serviceResponse);

        ResponseEntity<ProviderAnalyticsSummaryResponse> response =
            providerAnalyticsController.getSummary("MOBILITY_PROVIDER", 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(0, BigDecimal.valueOf(100).compareTo(response.getBody().getRevenue().getTotalRevenue()));
    }

    @Test
    void getSummaryShouldAcceptCaseInsensitiveProvider() {
        ProviderAnalyticsSummaryResponse serviceResponse = new ProviderAnalyticsSummaryResponse(
            new RevenueResponse(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO),
            new FleetUtilizationResponse(0, 0, 0, 0.0, 0, 0, 0, 0, 0, 0),
            new RentalActivityResponse(0, 0, 0, 0, 0, 0.0, 0.0),
            new EfficiencyMetricsResponse(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0.0, 0.0, 0.0, 0.0),
            LocalDateTime.now());

        when(providerAnalyticsService.getSummary(1L)).thenReturn(serviceResponse);

        ResponseEntity<ProviderAnalyticsSummaryResponse> response =
            providerAnalyticsController.getSummary("mobility_provider", 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getSummaryShouldThrowForNonProvider() {
        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
            () -> providerAnalyticsController.getSummary("USER", 1L));
        assertEquals("This resource requires MOBILITY_PROVIDER account type", ex.getMessage());
    }

    @Test
    void getSummaryShouldThrowForAdmin() {
        assertThrows(UnauthorizedException.class,
            () -> providerAnalyticsController.getSummary("ADMIN", 1L));
    }
}

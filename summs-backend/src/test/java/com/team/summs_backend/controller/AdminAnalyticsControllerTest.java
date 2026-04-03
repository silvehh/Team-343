package com.team.summs_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.team.summs_backend.dto.AdminAnalyticsSummaryResponse;
import com.team.summs_backend.dto.TransitServiceSummaryResponse;
import com.team.summs_backend.dto.VehicleUsageResponse;
import com.team.summs_backend.exception.UnauthorizedException;
import com.team.summs_backend.service.AdminAnalyticsService;

@ExtendWith(MockitoExtension.class)
class AdminAnalyticsControllerTest {

    @Mock
    private AdminAnalyticsService adminAnalyticsService;

    @InjectMocks
    private AdminAnalyticsController adminAnalyticsController;

    @Test
    void getSummaryShouldReturnOkForAdmin() {
        AdminAnalyticsSummaryResponse serviceResponse = new AdminAnalyticsSummaryResponse(
            50L, 100L, new VehicleUsageResponse(10, 20, 30), 0.67,
            List.of(), List.of(), new TransitServiceSummaryResponse(5, 1, 3.0, 60.0),
            LocalDateTime.now());

        when(adminAnalyticsService.getSummary()).thenReturn(serviceResponse);

        ResponseEntity<AdminAnalyticsSummaryResponse> response = adminAnalyticsController.getSummary("ADMIN");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(50L, response.getBody().getTotalRegisteredUsers());
    }

    @Test
    void getSummaryShouldAcceptCaseInsensitiveAdmin() {
        AdminAnalyticsSummaryResponse serviceResponse = new AdminAnalyticsSummaryResponse(
            10L, 5L, new VehicleUsageResponse(1, 2, 3), 0.0,
            List.of(), List.of(), new TransitServiceSummaryResponse(0, 0, 0.0, 0.0),
            LocalDateTime.now());

        when(adminAnalyticsService.getSummary()).thenReturn(serviceResponse);

        ResponseEntity<AdminAnalyticsSummaryResponse> response = adminAnalyticsController.getSummary("admin");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void getSummaryShouldThrowForNonAdmin() {
        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
            () -> adminAnalyticsController.getSummary("USER"));
        assertEquals("Admin access required", ex.getMessage());
    }

    @Test
    void getSummaryShouldThrowForProvider() {
        assertThrows(UnauthorizedException.class,
            () -> adminAnalyticsController.getSummary("MOBILITY_PROVIDER"));
    }
}

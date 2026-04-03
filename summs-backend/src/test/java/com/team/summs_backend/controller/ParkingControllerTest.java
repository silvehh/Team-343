package com.team.summs_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.team.summs_backend.dto.ParkingSpotResponse;
import com.team.summs_backend.service.ParkingService;

@ExtendWith(MockitoExtension.class)
class ParkingControllerTest {

    @Mock
    private ParkingService parkingService;

    @InjectMocks
    private ParkingController parkingController;

    @Test
    void shouldReturnAllParkingSpotsWhenNoFilters() {
        ParkingSpotResponse spotResponse = new ParkingSpotResponse(
            1L, "Spot A", "123 Main St", 45.5, -73.6, "GARAGE", 100, 25, 5.0, "AVAILABLE", "24/7", true, false);

        when(parkingService.getAllParkingSpots()).thenReturn(List.of(spotResponse));

        ResponseEntity<List<ParkingSpotResponse>> response = parkingController.getAllParkingSpots(null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(parkingService).getAllParkingSpots();
    }

    @Test
    void shouldFilterByTypeWhenTypeProvided() {
        when(parkingService.getParkingSpotsByType("GARAGE")).thenReturn(List.of());

        ResponseEntity<List<ParkingSpotResponse>> response = parkingController.getAllParkingSpots("GARAGE", null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(parkingService).getParkingSpotsByType("GARAGE");
    }

    @Test
    void shouldFilterAvailableOnlyWhenFlagIsTrue() {
        when(parkingService.getAvailableParkingSpots()).thenReturn(List.of());

        ResponseEntity<List<ParkingSpotResponse>> response = parkingController.getAllParkingSpots(null, true);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(parkingService).getAvailableParkingSpots();
    }

    @Test
    void shouldPreferTypeOverAvailableOnlyWhenBothProvided() {
        when(parkingService.getParkingSpotsByType("LOT")).thenReturn(List.of());

        ResponseEntity<List<ParkingSpotResponse>> response = parkingController.getAllParkingSpots("LOT", true);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(parkingService).getParkingSpotsByType("LOT");
    }

    @Test
    void shouldReturnAllWhenAvailableOnlyIsFalse() {
        when(parkingService.getAllParkingSpots()).thenReturn(List.of());

        ResponseEntity<List<ParkingSpotResponse>> response = parkingController.getAllParkingSpots(null, false);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(parkingService).getAllParkingSpots();
    }
}

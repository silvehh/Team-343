package com.team.summs_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

import com.team.summs_backend.dto.StationRequest;
import com.team.summs_backend.dto.StationResponse;
import com.team.summs_backend.exception.UnauthorizedException;
import com.team.summs_backend.service.StationService;

@ExtendWith(MockitoExtension.class)
class AdminStationControllerTest {

    @Mock
    private StationService stationService;

    @InjectMocks
    private AdminStationController adminStationController;

    @Test
    void getAllStationsShouldReturnOkForAdmin() {
        StationResponse stationResponse = new StationResponse(
            1L, "Station A", 45.5, -73.6, 10, 20, 15, 3L, 5L, 2L);

        when(stationService.getAllStations()).thenReturn(List.of(stationResponse));

        ResponseEntity<List<StationResponse>> response = adminStationController.getAllStations("ADMIN");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getAllStationsShouldThrowForNonAdmin() {
        UnauthorizedException ex = assertThrows(UnauthorizedException.class,
            () -> adminStationController.getAllStations("USER"));
        assertEquals("Admin access required", ex.getMessage());
    }

    @Test
    void createStationShouldReturnCreatedForAdmin() {
        StationRequest request = new StationRequest("New Station", 45.5, -73.6, 10, 20, 15);
        StationResponse serviceResponse = new StationResponse(
            1L, "New Station", 45.5, -73.6, 10, 20, 15, 0L, 0L, 0L);

        when(stationService.createStation(request)).thenReturn(serviceResponse);

        ResponseEntity<StationResponse> response = adminStationController.createStation("ADMIN", request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("New Station", response.getBody().name());
    }

    @Test
    void createStationShouldThrowForNonAdmin() {
        StationRequest request = new StationRequest("New Station", 45.5, -73.6, 10, 20, 15);

        assertThrows(UnauthorizedException.class,
            () -> adminStationController.createStation("MOBILITY_PROVIDER", request));
    }

    @Test
    void updateStationShouldReturnOkForAdmin() {
        StationRequest request = new StationRequest("Updated", 45.5, -73.6, 15, 25, 20);
        StationResponse serviceResponse = new StationResponse(
            1L, "Updated", 45.5, -73.6, 15, 25, 20, 3L, 5L, 2L);

        when(stationService.updateStation(1L, request)).thenReturn(serviceResponse);

        ResponseEntity<StationResponse> response = adminStationController.updateStation("ADMIN", 1L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Updated", response.getBody().name());
    }

    @Test
    void deleteStationShouldReturnNoContentForAdmin() {
        ResponseEntity<Void> response = adminStationController.deleteStation("ADMIN", 1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(stationService).deleteStation(1L);
    }

    @Test
    void deleteStationShouldThrowForNonAdmin() {
        assertThrows(UnauthorizedException.class,
            () -> adminStationController.deleteStation("USER", 1L));
    }
}

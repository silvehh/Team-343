package com.team.summs_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.team.summs_backend.dto.StationResponse;
import com.team.summs_backend.service.StationService;

@ExtendWith(MockitoExtension.class)
class StationControllerTest {

    @Mock
    private StationService stationService;

    @InjectMocks
    private StationController stationController;

    @Test
    void getAllStationsShouldReturnOk() {
        StationResponse stationResponse = new StationResponse(
            1L, "Station A", 45.5, -73.6, 10, 20, 15, 3L, 5L, 2L);

        when(stationService.getAllStations()).thenReturn(List.of(stationResponse));

        ResponseEntity<List<StationResponse>> response = stationController.getAllStations();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Station A", response.getBody().get(0).name());
    }

    @Test
    void getAllStationsShouldReturnEmptyList() {
        when(stationService.getAllStations()).thenReturn(List.of());

        ResponseEntity<List<StationResponse>> response = stationController.getAllStations();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(0, response.getBody().size());
    }
}

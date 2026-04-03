package com.team.summs_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.team.summs_backend.dto.VehicleResponse;
import com.team.summs_backend.service.VehicleService;

@ExtendWith(MockitoExtension.class)
class VehicleControllerTest {

    @Mock
    private VehicleService vehicleService;

    @InjectMocks
    private VehicleController vehicleController;

    @Test
    void getAvailableVehiclesShouldReturnOk() {
        VehicleResponse vehicleResponse = new VehicleResponse(
            1L, "CAR", "provider1", 1L, BigDecimal.valueOf(10.00), 1L, "Station A");

        when(vehicleService.getAvailableVehicles(null, null)).thenReturn(List.of(vehicleResponse));

        ResponseEntity<List<VehicleResponse>> response = vehicleController.getAvailableVehicles(null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("CAR", response.getBody().get(0).vehicleType());
    }

    @Test
    void getAvailableVehiclesShouldPassFilters() {
        when(vehicleService.getAvailableVehicles("BIKE", 2L)).thenReturn(List.of());

        ResponseEntity<List<VehicleResponse>> response = vehicleController.getAvailableVehicles("BIKE", 2L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(0, response.getBody().size());
    }
}

package com.team.summs_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
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

import com.team.summs_backend.dto.ProviderVehicleRequest;
import com.team.summs_backend.dto.VehicleResponse;
import com.team.summs_backend.exception.UnauthorizedException;
import com.team.summs_backend.service.ProviderVehicleService;

@ExtendWith(MockitoExtension.class)
class ProviderVehicleControllerTest {

    @Mock
    private ProviderVehicleService providerVehicleService;

    @InjectMocks
    private ProviderVehicleController providerVehicleController;

    @Test
    void getProviderVehiclesShouldReturnOk() {
        VehicleResponse vehicleResponse = new VehicleResponse(
            1L, "CAR", "provider1", 1L, BigDecimal.valueOf(10.00), 1L, "Station A");

        when(providerVehicleService.getProviderVehicles(1L)).thenReturn(List.of(vehicleResponse));

        ResponseEntity<List<VehicleResponse>> response =
            providerVehicleController.getProviderVehicles("MOBILITY_PROVIDER", 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getProviderVehiclesShouldThrowForNonProvider() {
        assertThrows(UnauthorizedException.class,
            () -> providerVehicleController.getProviderVehicles("USER", 1L));
    }

    @Test
    void addVehicleShouldReturnCreated() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, BigDecimal.valueOf(15.00));
        VehicleResponse serviceResponse = new VehicleResponse(
            1L, "CAR", "provider1", 1L, BigDecimal.valueOf(15.00), 1L, "Station A");

        when(providerVehicleService.addVehicle(1L, request)).thenReturn(serviceResponse);

        ResponseEntity<VehicleResponse> response =
            providerVehicleController.addVehicle("MOBILITY_PROVIDER", 1L, request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("CAR", response.getBody().vehicleType());
    }

    @Test
    void addVehicleShouldThrowForNonProvider() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, BigDecimal.valueOf(15.00));

        assertThrows(UnauthorizedException.class,
            () -> providerVehicleController.addVehicle("ADMIN", 1L, request));
    }

    @Test
    void updateVehicleShouldReturnOk() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, BigDecimal.valueOf(20.00));
        VehicleResponse serviceResponse = new VehicleResponse(
            1L, "CAR", "provider1", 1L, BigDecimal.valueOf(20.00), 1L, "Station A");

        when(providerVehicleService.updateVehicle(1L, 1L, request)).thenReturn(serviceResponse);

        ResponseEntity<VehicleResponse> response =
            providerVehicleController.updateVehicle("MOBILITY_PROVIDER", 1L, 1L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void deleteVehicleShouldReturnNoContent() {
        ResponseEntity<Void> response =
            providerVehicleController.deleteVehicle("MOBILITY_PROVIDER", 1L, 1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(providerVehicleService).deleteVehicle(1L, 1L);
    }

    @Test
    void deleteVehicleShouldThrowForNonProvider() {
        assertThrows(UnauthorizedException.class,
            () -> providerVehicleController.deleteVehicle("USER", 1L, 1L));
    }
}

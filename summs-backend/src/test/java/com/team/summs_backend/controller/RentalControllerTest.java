package com.team.summs_backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.team.summs_backend.dto.RentalRequest;
import com.team.summs_backend.dto.RentalResponse;
import com.team.summs_backend.dto.ReturnRequest;
import com.team.summs_backend.service.RentalService;

@ExtendWith(MockitoExtension.class)
class RentalControllerTest {

    @Mock
    private RentalService rentalService;

    @InjectMocks
    private RentalController rentalController;

    @Test
    void createRentalShouldReturnCreated() {
        RentalRequest request = new RentalRequest(1L, 1L);
        RentalResponse serviceResponse = new RentalResponse(
            1L, 1L, "CAR", "provider1", "ACTIVE", LocalDateTime.now(), null, null, "Station A", null);

        when(rentalService.createRental(request)).thenReturn(serviceResponse);

        ResponseEntity<RentalResponse> response = rentalController.createRental(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("ACTIVE", response.getBody().status());
    }

    @Test
    void returnRentalShouldReturnOk() {
        ReturnRequest request = new ReturnRequest(1L, 2L);
        RentalResponse serviceResponse = new RentalResponse(
            1L, 1L, "CAR", "provider1", "RETURNED", LocalDateTime.now().minusHours(2),
            LocalDateTime.now(), BigDecimal.valueOf(20.00), "Station A", "Station B");

        when(rentalService.returnRental(1L, request)).thenReturn(serviceResponse);

        ResponseEntity<RentalResponse> response = rentalController.returnRental(1L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("RETURNED", response.getBody().status());
    }

    @Test
    void getUserRentalsShouldReturnOk() {
        RentalResponse rentalResponse = new RentalResponse(
            1L, 1L, "CAR", "provider1", "ACTIVE", LocalDateTime.now(), null, null, "Station A", null);

        when(rentalService.getUserRentals(1L, null)).thenReturn(List.of(rentalResponse));

        ResponseEntity<List<RentalResponse>> response = rentalController.getUserRentals(1L, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getUserRentalsShouldPassStatusFilter() {
        when(rentalService.getUserRentals(1L, "ACTIVE")).thenReturn(List.of());

        ResponseEntity<List<RentalResponse>> response = rentalController.getUserRentals(1L, "ACTIVE");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(0, response.getBody().size());
    }
}

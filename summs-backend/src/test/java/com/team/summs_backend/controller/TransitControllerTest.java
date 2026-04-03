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

import com.team.summs_backend.dto.TransitRouteResponse;
import com.team.summs_backend.dto.TransitStopResponse;
import com.team.summs_backend.service.TransitService;

@ExtendWith(MockitoExtension.class)
class TransitControllerTest {

    @Mock
    private TransitService transitService;

    @InjectMocks
    private TransitController transitController;

    @Test
    void shouldReturnAllRoutesWhenNoFilters() {
        TransitRouteResponse routeResponse = new TransitRouteResponse(
            1L, "24", "Sherbrooke", "BUS", "Guy", "Papineau", 10, 2, 65, 90, "5:00-1:00", true);

        when(transitService.getAllRoutes()).thenReturn(List.of(routeResponse));

        ResponseEntity<List<TransitRouteResponse>> response = transitController.getAllRoutes(null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(transitService).getAllRoutes();
    }

    @Test
    void shouldFilterByTypeWhenTypeProvided() {
        when(transitService.getRoutesByType("BUS")).thenReturn(List.of());

        ResponseEntity<List<TransitRouteResponse>> response = transitController.getAllRoutes("BUS", null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(transitService).getRoutesByType("BUS");
    }

    @Test
    void shouldFilterActiveOnlyWhenFlagIsTrue() {
        when(transitService.getActiveRoutes()).thenReturn(List.of());

        ResponseEntity<List<TransitRouteResponse>> response = transitController.getAllRoutes(null, true);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(transitService).getActiveRoutes();
    }

    @Test
    void shouldPreferTypeOverActiveOnlyWhenBothProvided() {
        when(transitService.getRoutesByType("METRO")).thenReturn(List.of());

        ResponseEntity<List<TransitRouteResponse>> response = transitController.getAllRoutes("METRO", true);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(transitService).getRoutesByType("METRO");
    }

    @Test
    void getStopsByRouteShouldReturnOk() {
        TransitStopResponse stopResponse = new TransitStopResponse(
            1L, "Atwater", 45.49, -73.59, 1L, "24", 1, "10:30");

        when(transitService.getStopsByRoute(1L)).thenReturn(List.of(stopResponse));

        ResponseEntity<List<TransitStopResponse>> response = transitController.getStopsByRoute(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }
}

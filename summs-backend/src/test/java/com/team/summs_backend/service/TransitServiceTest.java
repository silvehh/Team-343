package com.team.summs_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.team.summs_backend.dto.TransitRouteResponse;
import com.team.summs_backend.dto.TransitStopResponse;
import com.team.summs_backend.model.TransitRoute;
import com.team.summs_backend.model.TransitStop;
import com.team.summs_backend.repository.TransitRouteRepository;
import com.team.summs_backend.repository.TransitStopRepository;

@ExtendWith(MockitoExtension.class)
class TransitServiceTest {

    @Mock
    private TransitRouteRepository transitRouteRepository;

    @Mock
    private TransitStopRepository transitStopRepository;

    @InjectMocks
    private TransitService transitService;

    private TransitRoute route;
    private TransitStop stop;

    @BeforeEach
    void setUp() {
        route = new TransitRoute();
        route.setId(1L);
        route.setRouteNumber("24");
        route.setRouteName("Sherbrooke");
        route.setTransitType(TransitRoute.TransitType.BUS);
        route.setStartStation("Guy-Concordia");
        route.setEndStation("Papineau");
        route.setFrequencyMinutes(10);
        route.setCurrentDelayMinutes(2);
        route.setCurrentCapacityPercent(65);
        route.setReliabilityScore(90);
        route.setOperatingHours("5:00-1:00");
        route.setActive(true);

        stop = new TransitStop();
        stop.setId(1L);
        stop.setName("Atwater");
        stop.setLatitude(45.49);
        stop.setLongitude(-73.59);
        stop.setRoute(route);
        stop.setStopOrder(1);
        stop.setNextArrival("10:30");
    }

    @Test
    void getAllRoutesShouldReturnMappedRoutes() {
        when(transitRouteRepository.findAll()).thenReturn(List.of(route));

        List<TransitRouteResponse> responses = transitService.getAllRoutes();

        assertEquals(1, responses.size());
        assertEquals("24", responses.get(0).getRouteNumber());
        assertEquals("Sherbrooke", responses.get(0).getRouteName());
        assertEquals("BUS", responses.get(0).getTransitType());
        assertEquals(true, responses.get(0).getIsActive());
    }

    @Test
    void getActiveRoutesShouldReturnOnlyActive() {
        when(transitRouteRepository.findByIsActiveTrue()).thenReturn(List.of(route));

        List<TransitRouteResponse> responses = transitService.getActiveRoutes();

        assertEquals(1, responses.size());
        assertEquals(true, responses.get(0).getIsActive());
    }

    @Test
    void getRoutesByTypeShouldFilterByBus() {
        when(transitRouteRepository.findByTransitType(TransitRoute.TransitType.BUS)).thenReturn(List.of(route));

        List<TransitRouteResponse> responses = transitService.getRoutesByType("BUS");

        assertEquals(1, responses.size());
        assertEquals("BUS", responses.get(0).getTransitType());
    }

    @Test
    void getRoutesByTypeShouldThrowWhenInvalidType() {
        assertThrows(IllegalArgumentException.class, () -> transitService.getRoutesByType("BOAT"));
    }

    @Test
    void getStopsByRouteShouldReturnOrderedStops() {
        when(transitStopRepository.findByRouteIdOrderByStopOrderAsc(1L)).thenReturn(List.of(stop));

        List<TransitStopResponse> responses = transitService.getStopsByRoute(1L);

        assertEquals(1, responses.size());
        assertEquals("Atwater", responses.get(0).getName());
        assertEquals(1, responses.get(0).getStopOrder());
        assertEquals("24", responses.get(0).getRouteNumber());
    }

    @Test
    void getAllRoutesShouldReturnEmptyList() {
        when(transitRouteRepository.findAll()).thenReturn(List.of());

        List<TransitRouteResponse> responses = transitService.getAllRoutes();

        assertEquals(0, responses.size());
    }

    @Test
    void getRoutesByTypeShouldHandleCaseInsensitiveType() {
        when(transitRouteRepository.findByTransitType(TransitRoute.TransitType.METRO)).thenReturn(List.of());

        List<TransitRouteResponse> responses = transitService.getRoutesByType("metro");

        assertEquals(0, responses.size());
    }
}

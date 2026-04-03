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

import com.team.summs_backend.dto.ParkingSpotResponse;
import com.team.summs_backend.model.ParkingSpot;
import com.team.summs_backend.repository.ParkingSpotRepository;

@ExtendWith(MockitoExtension.class)
class ParkingServiceTest {

    @Mock
    private ParkingSpotRepository parkingSpotRepository;

    @InjectMocks
    private ParkingService parkingService;

    private ParkingSpot spot;

    @BeforeEach
    void setUp() {
        spot = new ParkingSpot();
        spot.setId(1L);
        spot.setName("Downtown Parking");
        spot.setAddress("123 Main St, Montreal, QC");
        spot.setLatitude(45.5);
        spot.setLongitude(-73.6);
        spot.setParkingType(ParkingSpot.ParkingType.GARAGE);
        spot.setTotalSpots(100);
        spot.setAvailableSpots(25);
        spot.setPricePerHour(5.0);
        spot.setStatus(ParkingSpot.ParkingStatus.AVAILABLE);
        spot.setOperatingHours("24/7");
        spot.setHasEvCharging(true);
        spot.setHasDisabledAccess(true);
    }

    @Test
    void getAllParkingSpotsShouldReturnMappedResponses() {
        when(parkingSpotRepository.findAll()).thenReturn(List.of(spot));

        List<ParkingSpotResponse> responses = parkingService.getAllParkingSpots();

        assertEquals(1, responses.size());
        assertEquals("Downtown Parking", responses.get(0).getName());
        assertEquals("GARAGE", responses.get(0).getParkingType());
        assertEquals(100, responses.get(0).getTotalSpots());
        assertEquals(25, responses.get(0).getAvailableSpots());
        assertEquals(true, responses.get(0).getHasEvCharging());
        assertEquals(true, responses.get(0).getHasDisabledAccess());
    }

    @Test
    void getAvailableParkingSpotsShouldReturnOnlyAvailable() {
        when(parkingSpotRepository.findByAvailableSpotsGreaterThan(0)).thenReturn(List.of(spot));

        List<ParkingSpotResponse> responses = parkingService.getAvailableParkingSpots();

        assertEquals(1, responses.size());
    }

    @Test
    void getParkingSpotsByTypeShouldFilterByGarage() {
        when(parkingSpotRepository.findByParkingType(ParkingSpot.ParkingType.GARAGE)).thenReturn(List.of(spot));

        List<ParkingSpotResponse> responses = parkingService.getParkingSpotsByType("garage");

        assertEquals(1, responses.size());
        assertEquals("GARAGE", responses.get(0).getParkingType());
    }

    @Test
    void getParkingSpotsByTypeShouldFilterByStreet() {
        spot.setParkingType(ParkingSpot.ParkingType.STREET);
        when(parkingSpotRepository.findByParkingType(ParkingSpot.ParkingType.STREET)).thenReturn(List.of(spot));

        List<ParkingSpotResponse> responses = parkingService.getParkingSpotsByType("STREET");

        assertEquals(1, responses.size());
        assertEquals("STREET", responses.get(0).getParkingType());
    }

    @Test
    void getParkingSpotsByTypeShouldThrowWhenInvalidType() {
        assertThrows(IllegalArgumentException.class, () -> parkingService.getParkingSpotsByType("INVALID"));
    }

    @Test
    void getAllParkingSpotsShouldReturnEmptyList() {
        when(parkingSpotRepository.findAll()).thenReturn(List.of());

        List<ParkingSpotResponse> responses = parkingService.getAllParkingSpots();

        assertEquals(0, responses.size());
    }
}

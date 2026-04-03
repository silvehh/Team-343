package com.team.summs_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.team.summs_backend.dto.VehicleResponse;
import com.team.summs_backend.exception.InvalidInputException;
import com.team.summs_backend.model.MobilityProvider;
import com.team.summs_backend.model.Station;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle vehicle;
    private MobilityProvider provider;
    private Station station;

    @BeforeEach
    void setUp() {
        provider = new MobilityProvider();
        provider.setId(1L);
        provider.setUsername("provider1");

        station = new Station();
        station.setId(1L);
        station.setName("Station A");

        vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setVehicleType(VehicleType.CAR);
        vehicle.setProvider(provider);
        vehicle.setStation(station);
        vehicle.setPricePerHour(BigDecimal.valueOf(10.00));
        vehicle.setAvailable(true);
    }

    @Test
    void getAvailableVehiclesShouldReturnAllWhenNoFilters() {
        when(vehicleRepository.findAvailableWithJoins()).thenReturn(List.of(vehicle));

        List<VehicleResponse> responses = vehicleService.getAvailableVehicles(null, null);

        assertEquals(1, responses.size());
        assertEquals("CAR", responses.get(0).vehicleType());
        assertEquals("provider1", responses.get(0).providerName());
        assertEquals("Station A", responses.get(0).stationName());
    }

    @Test
    void getAvailableVehiclesShouldFilterByType() {
        when(vehicleRepository.findByVehicleTypeAvailableWithJoins(VehicleType.CAR)).thenReturn(List.of(vehicle));

        List<VehicleResponse> responses = vehicleService.getAvailableVehicles("CAR", null);

        assertEquals(1, responses.size());
        assertEquals("CAR", responses.get(0).vehicleType());
    }

    @Test
    void getAvailableVehiclesShouldFilterByStation() {
        when(vehicleRepository.findByStationIdAvailableWithJoins(1L)).thenReturn(List.of(vehicle));

        List<VehicleResponse> responses = vehicleService.getAvailableVehicles(null, 1L);

        assertEquals(1, responses.size());
    }

    @Test
    void getAvailableVehiclesShouldFilterByTypeAndStation() {
        when(vehicleRepository.findByStationIdAndVehicleTypeAvailableWithJoins(1L, VehicleType.BIKE)).thenReturn(List.of());

        List<VehicleResponse> responses = vehicleService.getAvailableVehicles("BIKE", 1L);

        assertEquals(0, responses.size());
    }

    @Test
    void getAvailableVehiclesShouldThrowWhenInvalidType() {
        InvalidInputException ex = assertThrows(InvalidInputException.class,
            () -> vehicleService.getAvailableVehicles("PLANE", null));
        assertEquals("Invalid vehicle type: PLANE. Must be CAR, BIKE, or SCOOTER", ex.getMessage());
    }

    @Test
    void getAvailableVehiclesShouldHandleBlankTypeAsNull() {
        when(vehicleRepository.findAvailableWithJoins()).thenReturn(List.of(vehicle));

        List<VehicleResponse> responses = vehicleService.getAvailableVehicles("  ", null);

        assertEquals(1, responses.size());
    }

    @Test
    void getAvailableVehiclesShouldHandleCaseInsensitiveType() {
        when(vehicleRepository.findByVehicleTypeAvailableWithJoins(VehicleType.SCOOTER)).thenReturn(List.of());

        List<VehicleResponse> responses = vehicleService.getAvailableVehicles("scooter", null);

        assertEquals(0, responses.size());
    }

    @Test
    void getAvailableVehiclesShouldMapVehicleWithNullStation() {
        vehicle.setStation(null);
        when(vehicleRepository.findAvailableWithJoins()).thenReturn(List.of(vehicle));

        List<VehicleResponse> responses = vehicleService.getAvailableVehicles(null, null);

        assertEquals(1, responses.size());
        assertEquals(null, responses.get(0).stationId());
        assertEquals(null, responses.get(0).stationName());
    }
}

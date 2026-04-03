package com.team.summs_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.team.summs_backend.dto.StationRequest;
import com.team.summs_backend.dto.StationResponse;
import com.team.summs_backend.exception.InvalidInputException;
import com.team.summs_backend.exception.StationNotFoundException;
import com.team.summs_backend.model.Station;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.RentalRepository;
import com.team.summs_backend.repository.StationRepository;
import com.team.summs_backend.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class StationServiceTest {

    @Mock
    private StationRepository stationRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private RentalRepository rentalRepository;

    @InjectMocks
    private StationService stationService;

    private Station station;

    @BeforeEach
    void setUp() {
        station = new Station();
        station.setId(1L);
        station.setName("Station A");
        station.setLatitude(45.5);
        station.setLongitude(-73.6);
        station.setCarCapacity(10);
        station.setBikeCapacity(20);
        station.setScooterCapacity(15);
    }

    @Test
    void getAllStationsShouldReturnStationsWithVehicleCounts() {
        when(stationRepository.findAll()).thenReturn(List.of(station));
        List<Object[]> counts = new java.util.ArrayList<>();
        counts.add(new Object[]{1L, VehicleType.CAR, 3L});
        when(vehicleRepository.countAvailableGroupedByStationAndType()).thenReturn(counts);

        List<StationResponse> responses = stationService.getAllStations();

        assertEquals(1, responses.size());
        assertEquals("Station A", responses.get(0).name());
        assertEquals(3L, responses.get(0).availableCars());
        assertEquals(0L, responses.get(0).availableBikes());
        assertEquals(0L, responses.get(0).availableScooters());
    }

    @Test
    void createStationShouldSucceed() {
        StationRequest request = new StationRequest("New Station", 45.5, -73.6, 10, 20, 15);

        Station saved = new Station();
        saved.setId(2L);
        saved.setName("New Station");
        saved.setLatitude(45.5);
        saved.setLongitude(-73.6);
        saved.setCarCapacity(10);
        saved.setBikeCapacity(20);
        saved.setScooterCapacity(15);

        when(stationRepository.save(any(Station.class))).thenReturn(saved);

        StationResponse response = stationService.createStation(request);

        assertEquals(2L, response.id());
        assertEquals("New Station", response.name());
        assertEquals(10, response.carCapacity());
    }

    @Test
    void createStationShouldThrowWhenNameIsBlank() {
        StationRequest request = new StationRequest("  ", 45.5, -73.6, 10, 20, 15);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> stationService.createStation(request));
        assertEquals("Station name is required", ex.getMessage());
    }

    @Test
    void createStationShouldThrowWhenNameIsNull() {
        StationRequest request = new StationRequest(null, 45.5, -73.6, 10, 20, 15);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> stationService.createStation(request));
        assertEquals("Station name is required", ex.getMessage());
    }

    @Test
    void createStationShouldThrowWhenCapacityIsNegative() {
        StationRequest request = new StationRequest("Station", 45.5, -73.6, -1, 20, 15);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> stationService.createStation(request));
        assertEquals("Capacity values must not be negative", ex.getMessage());
    }

    @Test
    void updateStationShouldSucceed() {
        StationRequest request = new StationRequest("Updated", 45.5, -73.6, 15, 25, 20);

        when(stationRepository.findById(1L)).thenReturn(Optional.of(station));
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.CAR)).thenReturn(5L);
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.BIKE)).thenReturn(3L);
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.SCOOTER)).thenReturn(2L);
        when(stationRepository.save(any(Station.class))).thenReturn(station);
        when(vehicleRepository.countAvailableGroupedByStationAndType()).thenReturn(List.of());

        StationResponse response = stationService.updateStation(1L, request);

        assertEquals("Updated", response.name());
    }

    @Test
    void updateStationShouldThrowWhenNotFound() {
        StationRequest request = new StationRequest("Updated", 45.5, -73.6, 15, 25, 20);
        when(stationRepository.findById(99L)).thenReturn(Optional.empty());

        StationNotFoundException ex = assertThrows(StationNotFoundException.class, () -> stationService.updateStation(99L, request));
        assertEquals("Station not found", ex.getMessage());
    }

    @Test
    void updateStationShouldThrowWhenCarCapacityBelowCurrentCount() {
        StationRequest request = new StationRequest("Updated", 45.5, -73.6, 2, 25, 20);

        when(stationRepository.findById(1L)).thenReturn(Optional.of(station));
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.CAR)).thenReturn(5L);
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.BIKE)).thenReturn(3L);
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.SCOOTER)).thenReturn(2L);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> stationService.updateStation(1L, request));
        assertEquals("Car capacity cannot be less than the 5 cars currently at this station", ex.getMessage());
    }

    @Test
    void updateStationShouldThrowWhenBikeCapacityBelowCurrentCount() {
        StationRequest request = new StationRequest("Updated", 45.5, -73.6, 10, 1, 20);

        when(stationRepository.findById(1L)).thenReturn(Optional.of(station));
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.CAR)).thenReturn(5L);
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.BIKE)).thenReturn(3L);
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.SCOOTER)).thenReturn(2L);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> stationService.updateStation(1L, request));
        assertEquals("Bike capacity cannot be less than the 3 bikes currently at this station", ex.getMessage());
    }

    @Test
    void deleteStationShouldSucceed() {
        when(stationRepository.existsById(1L)).thenReturn(true);
        when(vehicleRepository.findByStationId(1L)).thenReturn(List.of());
        when(rentalRepository.findByPickupStationId(1L)).thenReturn(List.of());
        when(rentalRepository.findByReturnStationId(1L)).thenReturn(List.of());

        stationService.deleteStation(1L);

        verify(stationRepository).deleteById(1L);
    }

    @Test
    void deleteStationShouldThrowWhenNotFound() {
        when(stationRepository.existsById(99L)).thenReturn(false);

        StationNotFoundException ex = assertThrows(StationNotFoundException.class, () -> stationService.deleteStation(99L));
        assertEquals("Station not found", ex.getMessage());
    }
}

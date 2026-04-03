package com.team.summs_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.team.summs_backend.dto.ProviderVehicleRequest;
import com.team.summs_backend.dto.VehicleResponse;
import com.team.summs_backend.exception.InvalidInputException;
import com.team.summs_backend.exception.StationFullException;
import com.team.summs_backend.exception.StationNotFoundException;
import com.team.summs_backend.exception.VehicleNotFoundException;
import com.team.summs_backend.model.MobilityProvider;
import com.team.summs_backend.model.Station;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.MobilityProviderRepository;
import com.team.summs_backend.repository.RentalRepository;
import com.team.summs_backend.repository.StationRepository;
import com.team.summs_backend.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class ProviderVehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private StationRepository stationRepository;

    @Mock
    private MobilityProviderRepository mobilityProviderRepository;

    @Mock
    private RentalRepository rentalRepository;

    @InjectMocks
    private ProviderVehicleService providerVehicleService;

    private MobilityProvider provider;
    private Station station;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        provider = new MobilityProvider();
        provider.setId(1L);
        provider.setUsername("provider1");
        provider.setMobilityOptions("Car,Bike,Scooter");

        station = new Station();
        station.setId(1L);
        station.setName("Station A");
        station.setCarCapacity(10);
        station.setBikeCapacity(20);
        station.setScooterCapacity(15);

        vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setVehicleType(VehicleType.CAR);
        vehicle.setProvider(provider);
        vehicle.setStation(station);
        vehicle.setPricePerHour(BigDecimal.valueOf(10.00));
        vehicle.setAvailable(true);
    }

    @Test
    void getProviderVehiclesShouldReturnVehicles() {
        when(mobilityProviderRepository.existsById(1L)).thenReturn(true);
        when(vehicleRepository.findByProviderIdWithStation(1L)).thenReturn(List.of(vehicle));

        List<VehicleResponse> responses = providerVehicleService.getProviderVehicles(1L);

        assertEquals(1, responses.size());
        assertEquals("CAR", responses.get(0).vehicleType());
    }

    @Test
    void getProviderVehiclesShouldThrowWhenProviderIdIsNull() {
        InvalidInputException ex = assertThrows(InvalidInputException.class,
            () -> providerVehicleService.getProviderVehicles(null));
        assertEquals("Provider ID is required", ex.getMessage());
    }

    @Test
    void getProviderVehiclesShouldThrowWhenProviderNotFound() {
        when(mobilityProviderRepository.existsById(99L)).thenReturn(false);

        InvalidInputException ex = assertThrows(InvalidInputException.class,
            () -> providerVehicleService.getProviderVehicles(99L));
        assertEquals("Mobility provider not found", ex.getMessage());
    }

    @Test
    void addVehicleShouldSucceed() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, BigDecimal.valueOf(15.00));

        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));
        when(stationRepository.findById(1L)).thenReturn(Optional.of(station));
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.CAR)).thenReturn(5L);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        VehicleResponse response = providerVehicleService.addVehicle(1L, request);

        assertEquals("CAR", response.vehicleType());
    }

    @Test
    void addVehicleShouldThrowWhenInvalidType() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("PLANE", 1L, BigDecimal.valueOf(15.00));
        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));

        InvalidInputException ex = assertThrows(InvalidInputException.class,
            () -> providerVehicleService.addVehicle(1L, request));
        assertEquals("Invalid vehicle type: PLANE. Must be CAR, BIKE, or SCOOTER", ex.getMessage());
    }

    @Test
    void addVehicleShouldThrowWhenTypeNotInProviderOptions() {
        provider.setMobilityOptions("Bike");
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, BigDecimal.valueOf(15.00));
        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));

        InvalidInputException ex = assertThrows(InvalidInputException.class,
            () -> providerVehicleService.addVehicle(1L, request));
        assertEquals("Your account is not registered to manage car vehicles. Your mobility options are: Bike", ex.getMessage());
    }

    @Test
    void addVehicleShouldThrowWhenPriceIsNull() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, null);
        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));

        InvalidInputException ex = assertThrows(InvalidInputException.class,
            () -> providerVehicleService.addVehicle(1L, request));
        assertEquals("Price per hour is required", ex.getMessage());
    }

    @Test
    void addVehicleShouldThrowWhenPriceIsZero() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, BigDecimal.ZERO);
        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));

        InvalidInputException ex = assertThrows(InvalidInputException.class,
            () -> providerVehicleService.addVehicle(1L, request));
        assertEquals("Price per hour must be greater than zero", ex.getMessage());
    }

    @Test
    void addVehicleShouldThrowWhenStationNotFound() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 99L, BigDecimal.valueOf(15.00));
        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));
        when(stationRepository.findById(99L)).thenReturn(Optional.empty());

        StationNotFoundException ex = assertThrows(StationNotFoundException.class,
            () -> providerVehicleService.addVehicle(1L, request));
        assertEquals("Station not found", ex.getMessage());
    }

    @Test
    void addVehicleShouldThrowWhenStationIsFull() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, BigDecimal.valueOf(15.00));
        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));
        when(stationRepository.findById(1L)).thenReturn(Optional.of(station));
        when(vehicleRepository.countByStationIdAndVehicleType(1L, VehicleType.CAR)).thenReturn(10L);

        StationFullException ex = assertThrows(StationFullException.class,
            () -> providerVehicleService.addVehicle(1L, request));
        assertEquals("Station Station A is full for cars (capacity: 10, current: 10)", ex.getMessage());
    }

    @Test
    void updateVehicleShouldSucceed() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, BigDecimal.valueOf(20.00));
        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));
        when(vehicleRepository.findByIdAndProviderIdWithStation(1L, 1L)).thenReturn(Optional.of(vehicle));
        when(stationRepository.findById(1L)).thenReturn(Optional.of(station));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        VehicleResponse response = providerVehicleService.updateVehicle(1L, 1L, request);

        assertEquals("CAR", response.vehicleType());
    }

    @Test
    void updateVehicleShouldThrowWhenVehicleNotFound() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, BigDecimal.valueOf(20.00));
        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));
        when(vehicleRepository.findByIdAndProviderIdWithStation(99L, 1L)).thenReturn(Optional.empty());

        VehicleNotFoundException ex = assertThrows(VehicleNotFoundException.class,
            () -> providerVehicleService.updateVehicle(1L, 99L, request));
        assertEquals("Vehicle not found or does not belong to this provider", ex.getMessage());
    }

    @Test
    void updateVehicleShouldValidateCapacityWhenStationChanged() {
        Station newStation = new Station();
        newStation.setId(2L);
        newStation.setName("Station B");
        newStation.setCarCapacity(5);

        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 2L, BigDecimal.valueOf(20.00));
        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));
        when(vehicleRepository.findByIdAndProviderIdWithStation(1L, 1L)).thenReturn(Optional.of(vehicle));
        when(stationRepository.findById(2L)).thenReturn(Optional.of(newStation));
        when(vehicleRepository.countByStationIdAndVehicleType(2L, VehicleType.CAR)).thenReturn(5L);

        StationFullException ex = assertThrows(StationFullException.class,
            () -> providerVehicleService.updateVehicle(1L, 1L, request));
        assertEquals("Station Station B is full for cars (capacity: 5, current: 5)", ex.getMessage());
    }

    @Test
    void deleteVehicleShouldSucceed() {
        when(mobilityProviderRepository.existsById(1L)).thenReturn(true);
        when(vehicleRepository.findByIdAndProviderIdWithStation(1L, 1L)).thenReturn(Optional.of(vehicle));
        when(rentalRepository.findByVehicleId(1L)).thenReturn(List.of());

        providerVehicleService.deleteVehicle(1L, 1L);

        verify(vehicleRepository).delete(vehicle);
    }

    @Test
    void deleteVehicleShouldThrowWhenVehicleIsRented() {
        vehicle.setAvailable(false);
        when(mobilityProviderRepository.existsById(1L)).thenReturn(true);
        when(vehicleRepository.findByIdAndProviderIdWithStation(1L, 1L)).thenReturn(Optional.of(vehicle));

        InvalidInputException ex = assertThrows(InvalidInputException.class,
            () -> providerVehicleService.deleteVehicle(1L, 1L));
        assertEquals("Cannot delete a vehicle that is currently rented out", ex.getMessage());
    }

    @Test
    void addVehicleShouldThrowWhenProviderIdIsNull() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("CAR", 1L, BigDecimal.valueOf(15.00));

        InvalidInputException ex = assertThrows(InvalidInputException.class,
            () -> providerVehicleService.addVehicle(null, request));
        assertEquals("Provider ID is required", ex.getMessage());
    }

    @Test
    void addVehicleShouldThrowWhenVehicleTypeIsBlank() {
        ProviderVehicleRequest request = new ProviderVehicleRequest("  ", 1L, BigDecimal.valueOf(15.00));
        when(mobilityProviderRepository.findById(1L)).thenReturn(Optional.of(provider));

        InvalidInputException ex = assertThrows(InvalidInputException.class,
            () -> providerVehicleService.addVehicle(1L, request));
        assertEquals("Vehicle type is required", ex.getMessage());
    }
}

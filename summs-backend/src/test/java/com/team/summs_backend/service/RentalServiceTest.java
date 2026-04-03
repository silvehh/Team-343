package com.team.summs_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.team.summs_backend.dto.RentalRequest;
import com.team.summs_backend.dto.RentalResponse;
import com.team.summs_backend.dto.ReturnRequest;
import com.team.summs_backend.exception.InvalidInputException;
import com.team.summs_backend.exception.RentalNotFoundException;
import com.team.summs_backend.exception.StationFullException;
import com.team.summs_backend.exception.VehicleNotAvailableException;
import com.team.summs_backend.exception.VehicleNotFoundException;
import com.team.summs_backend.model.AppUser;
import com.team.summs_backend.model.MobilityProvider;
import com.team.summs_backend.model.Rental;
import com.team.summs_backend.model.RentalStatus;
import com.team.summs_backend.model.Station;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.AppUserRepository;
import com.team.summs_backend.repository.RentalRepository;
import com.team.summs_backend.repository.StationRepository;
import com.team.summs_backend.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class RentalServiceTest {

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private StationRepository stationRepository;

    @InjectMocks
    private RentalService rentalService;

    private AppUser user;
    private Vehicle vehicle;
    private Station pickupStation;
    private Station returnStation;
    private MobilityProvider provider;

    @BeforeEach
    void setUp() {
        provider = new MobilityProvider();
        provider.setId(1L);
        provider.setUsername("provider1");

        pickupStation = new Station();
        pickupStation.setId(1L);
        pickupStation.setName("Station A");
        pickupStation.setCarCapacity(10);
        pickupStation.setBikeCapacity(10);
        pickupStation.setScooterCapacity(10);

        returnStation = new Station();
        returnStation.setId(2L);
        returnStation.setName("Station B");
        returnStation.setCarCapacity(10);
        returnStation.setBikeCapacity(10);
        returnStation.setScooterCapacity(10);

        user = new AppUser();
        user.setId(1L);
        user.setEmail("user@example.com");

        vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setVehicleType(VehicleType.CAR);
        vehicle.setAvailable(true);
        vehicle.setStation(pickupStation);
        vehicle.setProvider(provider);
        vehicle.setPricePerHour(BigDecimal.valueOf(10.00));
    }

    @Test
    void createRentalShouldSucceedWhenVehicleIsAvailable() {
        RentalRequest request = new RentalRequest(1L, 1L);

        when(appUserRepository.findById(1L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);

        Rental savedRental = new Rental();
        savedRental.setId(1L);
        savedRental.setUser(user);
        savedRental.setVehicle(vehicle);
        savedRental.setPickupStation(pickupStation);
        savedRental.setStatus(RentalStatus.ACTIVE);
        savedRental.setStartTime(LocalDateTime.now());
        when(rentalRepository.save(any(Rental.class))).thenReturn(savedRental);

        RentalResponse response = rentalService.createRental(request);

        assertEquals(1L, response.id());
        assertEquals("ACTIVE", response.status());
        assertEquals("Station A", response.pickupStationName());
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void createRentalShouldThrowWhenUserIdIsNull() {
        RentalRequest request = new RentalRequest(null, 1L);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> rentalService.createRental(request));
        assertEquals("userId and vehicleId are required", ex.getMessage());
    }

    @Test
    void createRentalShouldThrowWhenVehicleIdIsNull() {
        RentalRequest request = new RentalRequest(1L, null);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> rentalService.createRental(request));
        assertEquals("userId and vehicleId are required", ex.getMessage());
    }

    @Test
    void createRentalShouldThrowWhenUserNotFound() {
        RentalRequest request = new RentalRequest(99L, 1L);
        when(appUserRepository.findById(99L)).thenReturn(Optional.empty());

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> rentalService.createRental(request));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void createRentalShouldThrowWhenVehicleNotFound() {
        RentalRequest request = new RentalRequest(1L, 99L);
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        VehicleNotFoundException ex = assertThrows(VehicleNotFoundException.class, () -> rentalService.createRental(request));
        assertEquals("Vehicle not found", ex.getMessage());
    }

    @Test
    void createRentalShouldThrowWhenVehicleNotAvailable() {
        vehicle.setAvailable(false);
        RentalRequest request = new RentalRequest(1L, 1L);
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        VehicleNotAvailableException ex = assertThrows(VehicleNotAvailableException.class, () -> rentalService.createRental(request));
        assertEquals("Vehicle is not available for rental", ex.getMessage());
    }

    @Test
    void createRentalShouldThrowWhenVehicleNotAtStation() {
        vehicle.setStation(null);
        RentalRequest request = new RentalRequest(1L, 1L);
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(user));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        VehicleNotAvailableException ex = assertThrows(VehicleNotAvailableException.class, () -> rentalService.createRental(request));
        assertEquals("Vehicle is not at a station", ex.getMessage());
    }

    @Test
    void returnRentalShouldSucceed() {
        Rental rental = new Rental();
        rental.setId(1L);
        rental.setUser(user);
        rental.setVehicle(vehicle);
        rental.setPickupStation(pickupStation);
        rental.setStatus(RentalStatus.ACTIVE);
        rental.setStartTime(LocalDateTime.now().minusHours(3));

        ReturnRequest request = new ReturnRequest(1L, 2L);

        when(rentalRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(rental));
        when(stationRepository.findById(2L)).thenReturn(Optional.of(returnStation));
        when(vehicleRepository.countByStationIdAndVehicleType(2L, VehicleType.CAR)).thenReturn(5L);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);
        when(rentalRepository.save(any(Rental.class))).thenReturn(rental);

        RentalResponse response = rentalService.returnRental(1L, request);

        assertEquals("RETURNED", response.status());
        assertNotNull(response.totalCost());
    }

    @Test
    void returnRentalShouldThrowWhenUserIdIsNull() {
        ReturnRequest request = new ReturnRequest(null, 2L);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> rentalService.returnRental(1L, request));
        assertEquals("userId and stationId are required", ex.getMessage());
    }

    @Test
    void returnRentalShouldThrowWhenStationIdIsNull() {
        ReturnRequest request = new ReturnRequest(1L, null);

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> rentalService.returnRental(1L, request));
        assertEquals("userId and stationId are required", ex.getMessage());
    }

    @Test
    void returnRentalShouldThrowWhenRentalNotFound() {
        ReturnRequest request = new ReturnRequest(1L, 2L);
        when(rentalRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        RentalNotFoundException ex = assertThrows(RentalNotFoundException.class, () -> rentalService.returnRental(99L, request));
        assertEquals("Rental not found", ex.getMessage());
    }

    @Test
    void returnRentalShouldThrowWhenAlreadyReturned() {
        Rental rental = new Rental();
        rental.setId(1L);
        rental.setStatus(RentalStatus.RETURNED);

        ReturnRequest request = new ReturnRequest(1L, 2L);
        when(rentalRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(rental));

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> rentalService.returnRental(1L, request));
        assertEquals("Rental has already been returned", ex.getMessage());
    }

    @Test
    void returnRentalShouldThrowWhenStationNotFound() {
        Rental rental = new Rental();
        rental.setId(1L);
        rental.setStatus(RentalStatus.ACTIVE);

        ReturnRequest request = new ReturnRequest(1L, 99L);
        when(rentalRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(rental));
        when(stationRepository.findById(99L)).thenReturn(Optional.empty());

        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> rentalService.returnRental(1L, request));
        assertEquals("Station not found", ex.getMessage());
    }

    @Test
    void returnRentalShouldThrowWhenStationIsFull() {
        Rental rental = new Rental();
        rental.setId(1L);
        rental.setVehicle(vehicle);
        rental.setStatus(RentalStatus.ACTIVE);
        rental.setStartTime(LocalDateTime.now().minusHours(1));

        returnStation.setCarCapacity(5);
        ReturnRequest request = new ReturnRequest(1L, 2L);

        when(rentalRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(rental));
        when(stationRepository.findById(2L)).thenReturn(Optional.of(returnStation));
        when(vehicleRepository.countByStationIdAndVehicleType(2L, VehicleType.CAR)).thenReturn(5L);

        StationFullException ex = assertThrows(StationFullException.class, () -> rentalService.returnRental(1L, request));
        assertEquals("Station Station B is full for cars", ex.getMessage());
    }

    @Test
    void getUserRentalsShouldReturnAllWhenNoStatusFilter() {
        Rental rental = new Rental();
        rental.setId(1L);
        rental.setUser(user);
        rental.setVehicle(vehicle);
        rental.setPickupStation(pickupStation);
        rental.setStatus(RentalStatus.ACTIVE);
        rental.setStartTime(LocalDateTime.now());

        when(rentalRepository.findByUserId(1L)).thenReturn(List.of(rental));

        List<RentalResponse> responses = rentalService.getUserRentals(1L, null);
        assertEquals(1, responses.size());
    }

    @Test
    void getUserRentalsShouldFilterByStatus() {
        Rental rental = new Rental();
        rental.setId(1L);
        rental.setUser(user);
        rental.setVehicle(vehicle);
        rental.setPickupStation(pickupStation);
        rental.setStatus(RentalStatus.ACTIVE);
        rental.setStartTime(LocalDateTime.now());

        when(rentalRepository.findByUserIdAndStatus(1L, RentalStatus.ACTIVE)).thenReturn(List.of(rental));

        List<RentalResponse> responses = rentalService.getUserRentals(1L, "ACTIVE");
        assertEquals(1, responses.size());
        assertEquals("ACTIVE", responses.get(0).status());
    }

    @Test
    void getUserRentalsShouldThrowWhenInvalidStatus() {
        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> rentalService.getUserRentals(1L, "INVALID"));
        assertEquals("Invalid status: INVALID. Must be ACTIVE or RETURNED", ex.getMessage());
    }

    @Test
    void getUserRentalsShouldThrowWhenUserIdIsNull() {
        InvalidInputException ex = assertThrows(InvalidInputException.class, () -> rentalService.getUserRentals(null, null));
        assertEquals("userId is required", ex.getMessage());
    }

    @Test
    void getUserRentalsShouldReturnEmptyListWhenNoRentals() {
        when(rentalRepository.findByUserId(1L)).thenReturn(List.of());

        List<RentalResponse> responses = rentalService.getUserRentals(1L, null);
        assertEquals(0, responses.size());
    }

    @Test
    void returnRentalShouldCalculateCostWithMinimumOneHour() {
        Rental rental = new Rental();
        rental.setId(1L);
        rental.setUser(user);
        rental.setVehicle(vehicle);
        rental.setPickupStation(pickupStation);
        rental.setStatus(RentalStatus.ACTIVE);
        rental.setStartTime(LocalDateTime.now().minusMinutes(30)); // Less than 1 hour

        ReturnRequest request = new ReturnRequest(1L, 2L);

        when(rentalRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(rental));
        when(stationRepository.findById(2L)).thenReturn(Optional.of(returnStation));
        when(vehicleRepository.countByStationIdAndVehicleType(2L, VehicleType.CAR)).thenReturn(0L);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);
        when(rentalRepository.save(any(Rental.class))).thenAnswer(inv -> inv.getArgument(0));

        RentalResponse response = rentalService.returnRental(1L, request);

        // Minimum 1 hour * $10/hr = $10.00
        assertEquals(0, BigDecimal.valueOf(10.00).compareTo(response.totalCost()));
    }
}

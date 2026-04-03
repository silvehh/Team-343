package com.team.summs_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.team.summs_backend.dto.AdminAnalyticsSummaryResponse;
import com.team.summs_backend.model.MobilityProvider;
import com.team.summs_backend.model.ParkingSpot;
import com.team.summs_backend.model.Rental;
import com.team.summs_backend.model.RentalStatus;
import com.team.summs_backend.model.Station;
import com.team.summs_backend.model.TransitRoute;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.AppUserRepository;
import com.team.summs_backend.repository.ParkingSpotRepository;
import com.team.summs_backend.repository.RentalRepository;
import com.team.summs_backend.repository.TransitRouteRepository;

@ExtendWith(MockitoExtension.class)
class AdminAnalyticsServiceTest {

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private ParkingSpotRepository parkingSpotRepository;

    @Mock
    private TransitRouteRepository transitRouteRepository;

    @InjectMocks
    private AdminAnalyticsService adminAnalyticsService;

    private Vehicle carVehicle;
    private Vehicle bikeVehicle;
    private Vehicle scooterVehicle;
    private Station station;
    private MobilityProvider provider;

    @BeforeEach
    void setUp() {
        provider = new MobilityProvider();
        provider.setId(1L);
        provider.setUsername("provider1");

        station = new Station();
        station.setId(1L);
        station.setName("Downtown Station, Montreal");

        carVehicle = new Vehicle();
        carVehicle.setId(1L);
        carVehicle.setVehicleType(VehicleType.CAR);
        carVehicle.setProvider(provider);

        bikeVehicle = new Vehicle();
        bikeVehicle.setId(2L);
        bikeVehicle.setVehicleType(VehicleType.BIKE);
        bikeVehicle.setProvider(provider);

        scooterVehicle = new Vehicle();
        scooterVehicle.setId(3L);
        scooterVehicle.setVehicleType(VehicleType.SCOOTER);
        scooterVehicle.setProvider(provider);
    }

    private Rental createRental(Vehicle vehicle, RentalStatus status, Station pickupStation) {
        Rental rental = new Rental();
        rental.setVehicle(vehicle);
        rental.setStatus(status);
        rental.setPickupStation(pickupStation);
        rental.setStartTime(LocalDateTime.now().minusHours(2));
        if (status == RentalStatus.RETURNED) {
            rental.setEndTime(LocalDateTime.now());
            rental.setTotalCost(BigDecimal.valueOf(20.00));
        }
        return rental;
    }

    @Test
    void getSummaryShouldReturnCorrectUserCountAndTrips() {
        when(appUserRepository.count()).thenReturn(50L);
        when(rentalRepository.countByStatus(RentalStatus.RETURNED)).thenReturn(100L);
        when(rentalRepository.findAll()).thenReturn(List.of());
        when(rentalRepository.findByStatus(RentalStatus.ACTIVE)).thenReturn(List.of());
        when(parkingSpotRepository.findAll()).thenReturn(List.of());
        when(transitRouteRepository.findByIsActiveTrue()).thenReturn(List.of());

        AdminAnalyticsSummaryResponse response = adminAnalyticsService.getSummary();

        assertEquals(50L, response.getTotalRegisteredUsers());
        assertEquals(100L, response.getCompletedTrips());
        assertNotNull(response.getGeneratedAt());
    }

    @Test
    void getSummaryShouldComputeVehicleUsageByType() {
        Rental carRental = createRental(carVehicle, RentalStatus.RETURNED, station);
        Rental bikeRental = createRental(bikeVehicle, RentalStatus.RETURNED, station);
        Rental scooterRental = createRental(scooterVehicle, RentalStatus.RETURNED, station);

        when(appUserRepository.count()).thenReturn(10L);
        when(rentalRepository.countByStatus(RentalStatus.RETURNED)).thenReturn(3L);
        when(rentalRepository.findAll()).thenReturn(List.of(carRental, bikeRental, scooterRental));
        when(rentalRepository.findByStatus(RentalStatus.ACTIVE)).thenReturn(List.of());
        when(parkingSpotRepository.findAll()).thenReturn(List.of());
        when(transitRouteRepository.findByIsActiveTrue()).thenReturn(List.of());

        AdminAnalyticsSummaryResponse response = adminAnalyticsService.getSummary();

        assertEquals(1L, response.getRentalVehicleUsage().getCars());
        assertEquals(1L, response.getRentalVehicleUsage().getBikes());
        assertEquals(1L, response.getRentalVehicleUsage().getScooters());
        assertEquals(1.0, response.getBikeToScooterUsageRatio());
    }

    @Test
    void getSummaryShouldHandleZeroScootersForRatio() {
        Rental bikeRental = createRental(bikeVehicle, RentalStatus.RETURNED, station);

        when(appUserRepository.count()).thenReturn(5L);
        when(rentalRepository.countByStatus(RentalStatus.RETURNED)).thenReturn(1L);
        when(rentalRepository.findAll()).thenReturn(List.of(bikeRental));
        when(rentalRepository.findByStatus(RentalStatus.ACTIVE)).thenReturn(List.of());
        when(parkingSpotRepository.findAll()).thenReturn(List.of());
        when(transitRouteRepository.findByIsActiveTrue()).thenReturn(List.of());

        AdminAnalyticsSummaryResponse response = adminAnalyticsService.getSummary();

        assertEquals(0.0, response.getBikeToScooterUsageRatio());
    }

    @Test
    void getSummaryShouldComputeActiveRentalsByCity() {
        Rental activeRental = createRental(carVehicle, RentalStatus.ACTIVE, station);

        when(appUserRepository.count()).thenReturn(10L);
        when(rentalRepository.countByStatus(RentalStatus.RETURNED)).thenReturn(0L);
        when(rentalRepository.findAll()).thenReturn(List.of());
        when(rentalRepository.findByStatus(RentalStatus.ACTIVE)).thenReturn(List.of(activeRental));
        when(parkingSpotRepository.findAll()).thenReturn(List.of());
        when(transitRouteRepository.findByIsActiveTrue()).thenReturn(List.of());

        AdminAnalyticsSummaryResponse response = adminAnalyticsService.getSummary();

        assertEquals(1, response.getActiveRentalsByCity().size());
        assertEquals("Montreal", response.getActiveRentalsByCity().get(0).getCity());
        assertEquals(1L, response.getActiveRentalsByCity().get(0).getCount());
    }

    @Test
    void getSummaryShouldComputeParkingUtilization() {
        ParkingSpot spot = new ParkingSpot();
        spot.setAddress("123 Main St, Montreal, QC");
        spot.setTotalSpots(100);
        spot.setAvailableSpots(25);

        when(appUserRepository.count()).thenReturn(10L);
        when(rentalRepository.countByStatus(RentalStatus.RETURNED)).thenReturn(0L);
        when(rentalRepository.findAll()).thenReturn(List.of());
        when(rentalRepository.findByStatus(RentalStatus.ACTIVE)).thenReturn(List.of());
        when(parkingSpotRepository.findAll()).thenReturn(List.of(spot));
        when(transitRouteRepository.findByIsActiveTrue()).thenReturn(List.of());

        AdminAnalyticsSummaryResponse response = adminAnalyticsService.getSummary();

        assertEquals(1, response.getParkingUtilizationByCity().size());
        assertEquals(75.0, response.getParkingUtilizationByCity().get(0).getUtilizationPercent());
    }

    @Test
    void getSummaryShouldComputeTransitSummary() {
        TransitRoute activeRoute = new TransitRoute();
        activeRoute.setActive(true);
        activeRoute.setCurrentDelayMinutes(5);
        activeRoute.setCurrentCapacityPercent(70);

        TransitRoute noDelayRoute = new TransitRoute();
        noDelayRoute.setActive(true);
        noDelayRoute.setCurrentDelayMinutes(0);
        noDelayRoute.setCurrentCapacityPercent(30);

        when(appUserRepository.count()).thenReturn(10L);
        when(rentalRepository.countByStatus(RentalStatus.RETURNED)).thenReturn(0L);
        when(rentalRepository.findAll()).thenReturn(List.of());
        when(rentalRepository.findByStatus(RentalStatus.ACTIVE)).thenReturn(List.of());
        when(parkingSpotRepository.findAll()).thenReturn(List.of());
        when(transitRouteRepository.findByIsActiveTrue()).thenReturn(List.of(activeRoute, noDelayRoute));

        AdminAnalyticsSummaryResponse response = adminAnalyticsService.getSummary();

        assertEquals(2L, response.getTransitServiceSummary().getActiveRoutes());
        assertEquals(1L, response.getTransitServiceSummary().getDelayedRoutes());
        assertEquals(5.0, response.getTransitServiceSummary().getAverageDelayMinutes());
        assertEquals(50.0, response.getTransitServiceSummary().getAverageCapacityPercent());
    }

    @Test
    void getSummaryShouldHandleEmptyData() {
        when(appUserRepository.count()).thenReturn(0L);
        when(rentalRepository.countByStatus(RentalStatus.RETURNED)).thenReturn(0L);
        when(rentalRepository.findAll()).thenReturn(List.of());
        when(rentalRepository.findByStatus(RentalStatus.ACTIVE)).thenReturn(List.of());
        when(parkingSpotRepository.findAll()).thenReturn(List.of());
        when(transitRouteRepository.findByIsActiveTrue()).thenReturn(List.of());

        AdminAnalyticsSummaryResponse response = adminAnalyticsService.getSummary();

        assertEquals(0L, response.getTotalRegisteredUsers());
        assertEquals(0L, response.getCompletedTrips());
        assertEquals(0L, response.getRentalVehicleUsage().getCars());
        assertEquals(0, response.getActiveRentalsByCity().size());
        assertEquals(0, response.getParkingUtilizationByCity().size());
        assertEquals(0L, response.getTransitServiceSummary().getActiveRoutes());
    }
}

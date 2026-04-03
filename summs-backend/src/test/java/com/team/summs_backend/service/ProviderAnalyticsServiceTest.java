package com.team.summs_backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
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

import com.team.summs_backend.dto.ProviderAnalyticsSummaryResponse;
import com.team.summs_backend.model.MobilityProvider;
import com.team.summs_backend.model.Rental;
import com.team.summs_backend.model.RentalStatus;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.MobilityProviderRepository;
import com.team.summs_backend.repository.RentalRepository;
import com.team.summs_backend.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class ProviderAnalyticsServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private MobilityProviderRepository mobilityProviderRepository;

    @InjectMocks
    private ProviderAnalyticsService providerAnalyticsService;

    private MobilityProvider provider;
    private Vehicle carVehicle;
    private Vehicle bikeVehicle;

    @BeforeEach
    void setUp() {
        provider = new MobilityProvider();
        provider.setId(1L);
        provider.setUsername("provider1");

        carVehicle = new Vehicle();
        carVehicle.setId(1L);
        carVehicle.setVehicleType(VehicleType.CAR);
        carVehicle.setProvider(provider);
        carVehicle.setAvailable(true);
        carVehicle.setPricePerHour(BigDecimal.valueOf(10.00));

        bikeVehicle = new Vehicle();
        bikeVehicle.setId(2L);
        bikeVehicle.setVehicleType(VehicleType.BIKE);
        bikeVehicle.setProvider(provider);
        bikeVehicle.setAvailable(false);
        bikeVehicle.setPricePerHour(BigDecimal.valueOf(5.00));
    }

    private Rental createCompletedRental(Vehicle vehicle, BigDecimal cost, int durationMinutes) {
        Rental rental = new Rental();
        rental.setVehicle(vehicle);
        rental.setStatus(RentalStatus.RETURNED);
        rental.setTotalCost(cost);
        rental.setStartTime(LocalDateTime.now().minusMinutes(durationMinutes));
        rental.setEndTime(LocalDateTime.now());
        return rental;
    }

    @Test
    void getSummaryShouldThrowWhenProviderIdIsNull() {
        assertThrows(IllegalArgumentException.class, () -> providerAnalyticsService.getSummary(null));
    }

    @Test
    void getSummaryShouldThrowWhenProviderNotFound() {
        when(mobilityProviderRepository.existsById(99L)).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> providerAnalyticsService.getSummary(99L));
    }

    @Test
    void getSummaryShouldComputeRevenueBreakdown() {
        when(mobilityProviderRepository.existsById(1L)).thenReturn(true);

        Rental carRental = createCompletedRental(carVehicle, BigDecimal.valueOf(30.00), 180);
        Rental bikeRental = createCompletedRental(bikeVehicle, BigDecimal.valueOf(10.00), 120);

        when(rentalRepository.findByProviderIdAndStatus(1L, RentalStatus.RETURNED))
            .thenReturn(List.of(carRental, bikeRental));
        when(rentalRepository.findByProviderIdAndStatus(1L, RentalStatus.ACTIVE))
            .thenReturn(List.of());
        when(vehicleRepository.findByProviderId(1L))
            .thenReturn(List.of(carVehicle, bikeVehicle));

        ProviderAnalyticsSummaryResponse response = providerAnalyticsService.getSummary(1L);

        assertEquals(0, BigDecimal.valueOf(40.00).compareTo(response.getRevenue().getTotalRevenue()));
        assertEquals(0, BigDecimal.valueOf(30.00).compareTo(response.getRevenue().getCarRevenue()));
        assertEquals(0, BigDecimal.valueOf(10.00).compareTo(response.getRevenue().getBikeRevenue()));
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getRevenue().getScooterRevenue()));
        assertNotNull(response.getGeneratedAt());
    }

    @Test
    void getSummaryShouldComputeFleetUtilization() {
        when(mobilityProviderRepository.existsById(1L)).thenReturn(true);
        when(rentalRepository.findByProviderIdAndStatus(1L, RentalStatus.RETURNED)).thenReturn(List.of());
        when(rentalRepository.findByProviderIdAndStatus(1L, RentalStatus.ACTIVE)).thenReturn(List.of());
        when(vehicleRepository.findByProviderId(1L)).thenReturn(List.of(carVehicle, bikeVehicle));

        ProviderAnalyticsSummaryResponse response = providerAnalyticsService.getSummary(1L);

        assertEquals(2L, response.getFleetUtilization().getTotalVehicles());
        assertEquals(1L, response.getFleetUtilization().getAvailableVehicles());
        assertEquals(1L, response.getFleetUtilization().getRentedVehicles());
        assertEquals(50.0, response.getFleetUtilization().getAvailabilityRate());
        assertEquals(1L, response.getFleetUtilization().getAvailableCars());
        assertEquals(0L, response.getFleetUtilization().getAvailableBikes());
        assertEquals(1L, response.getFleetUtilization().getRentedBikes());
    }

    @Test
    void getSummaryShouldComputeRentalActivity() {
        when(mobilityProviderRepository.existsById(1L)).thenReturn(true);

        Rental carRental = createCompletedRental(carVehicle, BigDecimal.valueOf(30.00), 120);

        when(rentalRepository.findByProviderIdAndStatus(1L, RentalStatus.RETURNED))
            .thenReturn(List.of(carRental));
        when(rentalRepository.findByProviderIdAndStatus(1L, RentalStatus.ACTIVE))
            .thenReturn(List.of());
        when(vehicleRepository.findByProviderId(1L))
            .thenReturn(List.of(carVehicle, bikeVehicle));

        ProviderAnalyticsSummaryResponse response = providerAnalyticsService.getSummary(1L);

        assertEquals(1L, response.getRentalActivity().getCompletedRentals());
        assertEquals(0L, response.getRentalActivity().getActiveRentals());
        assertEquals(1L, response.getRentalActivity().getCompletedCarRentals());
        assertEquals(0L, response.getRentalActivity().getCompletedBikeRentals());
    }

    @Test
    void getSummaryShouldComputeEfficiencyMetrics() {
        when(mobilityProviderRepository.existsById(1L)).thenReturn(true);

        Rental carRental = createCompletedRental(carVehicle, BigDecimal.valueOf(40.00), 120);

        when(rentalRepository.findByProviderIdAndStatus(1L, RentalStatus.RETURNED))
            .thenReturn(List.of(carRental));
        when(rentalRepository.findByProviderIdAndStatus(1L, RentalStatus.ACTIVE))
            .thenReturn(List.of());
        when(vehicleRepository.findByProviderId(1L))
            .thenReturn(List.of(carVehicle, bikeVehicle));

        ProviderAnalyticsSummaryResponse response = providerAnalyticsService.getSummary(1L);

        assertEquals(0, BigDecimal.valueOf(40.00).compareTo(response.getEfficiencyMetrics().getAverageRevenuePerRental()));
        assertEquals(0, BigDecimal.valueOf(20.00).compareTo(response.getEfficiencyMetrics().getRevenuePerVehicle()));
        assertEquals(100.0, response.getEfficiencyMetrics().getCarRevenuePercentage());
    }

    @Test
    void getSummaryShouldHandleEmptyData() {
        when(mobilityProviderRepository.existsById(1L)).thenReturn(true);
        when(rentalRepository.findByProviderIdAndStatus(1L, RentalStatus.RETURNED)).thenReturn(List.of());
        when(rentalRepository.findByProviderIdAndStatus(1L, RentalStatus.ACTIVE)).thenReturn(List.of());
        when(vehicleRepository.findByProviderId(1L)).thenReturn(List.of());

        ProviderAnalyticsSummaryResponse response = providerAnalyticsService.getSummary(1L);

        assertEquals(0, BigDecimal.ZERO.compareTo(response.getRevenue().getTotalRevenue()));
        assertEquals(0L, response.getFleetUtilization().getTotalVehicles());
        assertEquals(0L, response.getRentalActivity().getCompletedRentals());
        assertEquals(0, BigDecimal.ZERO.compareTo(response.getEfficiencyMetrics().getAverageRevenuePerRental()));
    }
}

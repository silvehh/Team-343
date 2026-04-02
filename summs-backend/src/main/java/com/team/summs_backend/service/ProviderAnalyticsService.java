package com.team.summs_backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team.summs_backend.dto.FleetUtilizationResponse;
import com.team.summs_backend.dto.ProviderAnalyticsSummaryResponse;
import com.team.summs_backend.dto.RentalActivityResponse;
import com.team.summs_backend.dto.RevenueResponse;
import com.team.summs_backend.dto.EfficiencyMetricsResponse;
import com.team.summs_backend.model.MobilityProvider;
import com.team.summs_backend.model.Rental;
import com.team.summs_backend.model.RentalStatus;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.MobilityProviderRepository;
import com.team.summs_backend.repository.RentalRepository;
import com.team.summs_backend.repository.VehicleRepository;

@Service
public class ProviderAnalyticsService {

  private final VehicleRepository vehicleRepository;
  private final RentalRepository rentalRepository;
  private final MobilityProviderRepository mobilityProviderRepository;

  public ProviderAnalyticsService(
      VehicleRepository vehicleRepository,
      RentalRepository rentalRepository,
      MobilityProviderRepository mobilityProviderRepository) {
    this.vehicleRepository = vehicleRepository;
    this.rentalRepository = rentalRepository;
    this.mobilityProviderRepository = mobilityProviderRepository;
  }

  @Transactional(readOnly = true)
  public ProviderAnalyticsSummaryResponse getSummary(Long providerId) {
    validateProviderId(providerId);

    RevenueResponse revenue = computeRevenue(providerId);
    FleetUtilizationResponse fleetUtilization = computeFleetUtilization(providerId);
    RentalActivityResponse rentalActivity = computeRentalActivity(providerId);
    EfficiencyMetricsResponse efficiencyMetrics = computeEfficiencyMetrics(providerId, revenue, fleetUtilization, rentalActivity);

    return new ProviderAnalyticsSummaryResponse(
        revenue,
        fleetUtilization,
        rentalActivity,
        efficiencyMetrics,
        LocalDateTime.now());
  }

  private void validateProviderId(Long providerId) {
    if (providerId == null || !mobilityProviderRepository.existsById(providerId)) {
      throw new IllegalArgumentException("Invalid provider ID");
    }
  }

  private RevenueResponse computeRevenue(Long providerId) {
    List<Rental> completedRentals = rentalRepository.findByProviderIdAndStatus(providerId, RentalStatus.RETURNED);

    BigDecimal totalRevenue = BigDecimal.ZERO;
    BigDecimal carRevenue = BigDecimal.ZERO;
    BigDecimal bikeRevenue = BigDecimal.ZERO;
    BigDecimal scooterRevenue = BigDecimal.ZERO;

    for (Rental rental : completedRentals) {
      if (rental.getTotalCost() == null) {
        continue;
      }
      totalRevenue = totalRevenue.add(rental.getTotalCost());

      VehicleType vehicleType = rental.getVehicle().getVehicleType();
      switch (vehicleType) {
        case CAR:
          carRevenue = carRevenue.add(rental.getTotalCost());
          break;
        case BIKE:
          bikeRevenue = bikeRevenue.add(rental.getTotalCost());
          break;
        case SCOOTER:
          scooterRevenue = scooterRevenue.add(rental.getTotalCost());
          break;
        default:
          break;
      }
    }

    return new RevenueResponse(totalRevenue, carRevenue, bikeRevenue, scooterRevenue);
  }

  private FleetUtilizationResponse computeFleetUtilization(Long providerId) {
    List<Vehicle> allVehicles = vehicleRepository.findByProviderId(providerId);

    long totalVehicles = allVehicles.size();
    long availableVehicles = 0;
    long rentedVehicles = 0;

    long availableCars = 0;
    long availableBikes = 0;
    long availableScooters = 0;

    long rentedCars = 0;
    long rentedBikes = 0;
    long rentedScooters = 0;

    for (Vehicle vehicle : allVehicles) {
      VehicleType type = vehicle.getVehicleType();

      if (vehicle.isAvailable()) {
        availableVehicles++;
        switch (type) {
          case CAR:
            availableCars++;
            break;
          case BIKE:
            availableBikes++;
            break;
          case SCOOTER:
            availableScooters++;
            break;
          default:
            break;
        }
      } else {
        rentedVehicles++;
        switch (type) {
          case CAR:
            rentedCars++;
            break;
          case BIKE:
            rentedBikes++;
            break;
          case SCOOTER:
            rentedScooters++;
            break;
          default:
            break;
        }
      }
    }

    double availabilityRate = totalVehicles > 0 ? (availableVehicles * 100.0) / totalVehicles : 0.0;

    return new FleetUtilizationResponse(
        totalVehicles,
        availableVehicles,
        rentedVehicles,
        availabilityRate,
        availableCars,
        availableBikes,
        availableScooters,
        rentedCars,
        rentedBikes,
        rentedScooters);
  }

  private RentalActivityResponse computeRentalActivity(Long providerId) {
    List<Rental> completedRentals = rentalRepository.findByProviderIdAndStatus(providerId, RentalStatus.RETURNED);
    List<Rental> activeRentals = rentalRepository.findByProviderIdAndStatus(providerId, RentalStatus.ACTIVE);

    long completedCarRentals = 0;
    long completedBikeRentals = 0;
    long completedScooterRentals = 0;
    long totalDurationMinutes = 0;

    for (Rental rental : completedRentals) {
      VehicleType type = rental.getVehicle().getVehicleType();
      switch (type) {
        case CAR:
          completedCarRentals++;
          break;
        case BIKE:
          completedBikeRentals++;
          break;
        case SCOOTER:
          completedScooterRentals++;
          break;
        default:
          break;
      }

      if (rental.getStartTime() != null && rental.getEndTime() != null) {
        long minutes = ChronoUnit.MINUTES.between(rental.getStartTime(), rental.getEndTime());
        totalDurationMinutes += minutes;
      }
    }

    double averageDuration = completedRentals.size() > 0 ? totalDurationMinutes / (double) completedRentals.size() : 0.0;

    double bikeToScooterRatio = completedScooterRentals == 0 ? 0.0 : (double) completedBikeRentals / (double) completedScooterRentals;

    return new RentalActivityResponse(
        completedRentals.size(),
        activeRentals.size(),
        completedCarRentals,
        completedBikeRentals,
        completedScooterRentals,
        averageDuration,
        bikeToScooterRatio);
  }

  private EfficiencyMetricsResponse computeEfficiencyMetrics(
      Long providerId,
      RevenueResponse revenue,
      FleetUtilizationResponse fleetUtilization,
      RentalActivityResponse rentalActivity) {

    List<Rental> completedRentals = rentalRepository.findByProviderIdAndStatus(providerId, RentalStatus.RETURNED);

    // Calculate average revenue per rental
    BigDecimal averageRevenuePerRental = BigDecimal.ZERO;
    if (completedRentals.size() > 0) {
      averageRevenuePerRental = revenue.getTotalRevenue()
          .divide(BigDecimal.valueOf(completedRentals.size()), 2, java.math.RoundingMode.HALF_UP);
    }

    // Calculate average revenue per rental by type
    BigDecimal averageCarRentalRevenue = BigDecimal.ZERO;
    if (rentalActivity.getCompletedCarRentals() > 0) {
      averageCarRentalRevenue = revenue.getCarRevenue()
          .divide(BigDecimal.valueOf(rentalActivity.getCompletedCarRentals()), 2, java.math.RoundingMode.HALF_UP);
    }

    BigDecimal averageBikeRentalRevenue = BigDecimal.ZERO;
    if (rentalActivity.getCompletedBikeRentals() > 0) {
      averageBikeRentalRevenue = revenue.getBikeRevenue()
          .divide(BigDecimal.valueOf(rentalActivity.getCompletedBikeRentals()), 2, java.math.RoundingMode.HALF_UP);
    }

    BigDecimal averageScooterRentalRevenue = BigDecimal.ZERO;
    if (rentalActivity.getCompletedScooterRentals() > 0) {
      averageScooterRentalRevenue = revenue.getScooterRevenue()
          .divide(BigDecimal.valueOf(rentalActivity.getCompletedScooterRentals()), 2, java.math.RoundingMode.HALF_UP);
    }

    // Calculate revenue per vehicle
    BigDecimal revenuePerVehicle = BigDecimal.ZERO;
    if (fleetUtilization.getTotalVehicles() > 0) {
      revenuePerVehicle = revenue.getTotalRevenue()
          .divide(BigDecimal.valueOf(fleetUtilization.getTotalVehicles()), 2, java.math.RoundingMode.HALF_UP);
    }

    // Calculate average rental frequency per vehicle
    double averageRentalFrequencyPerVehicle = 0.0;
    if (fleetUtilization.getTotalVehicles() > 0) {
      averageRentalFrequencyPerVehicle = (double) completedRentals.size() / fleetUtilization.getTotalVehicles();
    }

    // Calculate revenue percentages by type
    BigDecimal totalRevenue = revenue.getTotalRevenue();
    double carRevenuePercentage = 0.0;
    double bikeRevenuePercentage = 0.0;
    double scooterRevenuePercentage = 0.0;

    if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
      carRevenuePercentage = revenue.getCarRevenue()
          .divide(totalRevenue, 4, java.math.RoundingMode.HALF_UP)
          .multiply(BigDecimal.valueOf(100))
          .doubleValue();
      bikeRevenuePercentage = revenue.getBikeRevenue()
          .divide(totalRevenue, 4, java.math.RoundingMode.HALF_UP)
          .multiply(BigDecimal.valueOf(100))
          .doubleValue();
      scooterRevenuePercentage = revenue.getScooterRevenue()
          .divide(totalRevenue, 4, java.math.RoundingMode.HALF_UP)
          .multiply(BigDecimal.valueOf(100))
          .doubleValue();
    }

    return new EfficiencyMetricsResponse(
        averageRevenuePerRental,
        averageCarRentalRevenue,
        averageBikeRentalRevenue,
        averageScooterRentalRevenue,
        revenuePerVehicle,
        averageRentalFrequencyPerVehicle,
        carRevenuePercentage,
        bikeRevenuePercentage,
        scooterRevenuePercentage);
  }
}

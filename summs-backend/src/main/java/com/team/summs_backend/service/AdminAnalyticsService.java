package com.team.summs_backend.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team.summs_backend.dto.AdminAnalyticsSummaryResponse;
import com.team.summs_backend.dto.CityCountResponse;
import com.team.summs_backend.dto.ParkingUtilizationResponse;
import com.team.summs_backend.dto.TransitServiceSummaryResponse;
import com.team.summs_backend.dto.VehicleUsageResponse;
import com.team.summs_backend.model.ParkingSpot;
import com.team.summs_backend.model.Rental;
import com.team.summs_backend.model.RentalStatus;
import com.team.summs_backend.model.TransitRoute;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.AppUserRepository;
import com.team.summs_backend.repository.ParkingSpotRepository;
import com.team.summs_backend.repository.RentalRepository;
import com.team.summs_backend.repository.TransitRouteRepository;

@Service
public class AdminAnalyticsService {

  private final AppUserRepository appUserRepository;
  private final RentalRepository rentalRepository;
  private final ParkingSpotRepository parkingSpotRepository;
  private final TransitRouteRepository transitRouteRepository;

  public AdminAnalyticsService(
      AppUserRepository appUserRepository,
      RentalRepository rentalRepository,
      ParkingSpotRepository parkingSpotRepository,
      TransitRouteRepository transitRouteRepository) {
    this.appUserRepository = appUserRepository;
    this.rentalRepository = rentalRepository;
    this.parkingSpotRepository = parkingSpotRepository;
    this.transitRouteRepository = transitRouteRepository;
  }

  @Transactional(readOnly = true)
  public AdminAnalyticsSummaryResponse getSummary() {
    long totalRegisteredUsers = appUserRepository.count();
    long completedTrips = rentalRepository.countByStatus(RentalStatus.RETURNED);

    VehicleUsageResponse usage = computeRentalUsageByType(rentalRepository.findAll());
    double bikeToScooterRatio = usage.getScooters() == 0 ? 0.0
        : ((double) usage.getBikes()) / ((double) usage.getScooters());

    List<CityCountResponse> activeRentalsByCity = computeActiveRentalsByCity();
    List<ParkingUtilizationResponse> parkingUtilizationByCity = computeParkingUtilizationByCity();
    TransitServiceSummaryResponse transitSummary = computeTransitSummary();

    return new AdminAnalyticsSummaryResponse(
        totalRegisteredUsers,
        completedTrips,
        usage,
        bikeToScooterRatio,
        activeRentalsByCity,
        parkingUtilizationByCity,
        transitSummary,
        LocalDateTime.now());
  }

  private VehicleUsageResponse computeRentalUsageByType(List<Rental> rentals) {
    long cars = 0;
    long bikes = 0;
    long scooters = 0;

    for (Rental rental : rentals) {
      if (rental.getVehicle() == null) {
        continue;
      }
      VehicleType t = rental.getVehicle().getVehicleType();
      if (t == null) {
        continue;
      }
      switch (t) {
        case CAR -> cars++;
        case BIKE -> bikes++;
        case SCOOTER -> scooters++;
        default -> {
        }
      }
    }

    return new VehicleUsageResponse(cars, bikes, scooters);
  }

  private List<CityCountResponse> computeActiveRentalsByCity() {
    List<Rental> active = rentalRepository.findByStatus(RentalStatus.ACTIVE);
    Map<String, Long> counts = new HashMap<>();
    for (Rental rental : active) {
      String label = "Unknown";
      if (rental.getPickupStation() != null && rental.getPickupStation().getName() != null) {
        label = normalizeCityLabel(rental.getPickupStation().getName());
      }
      counts.put(label, counts.getOrDefault(label, 0L) + 1L);
    }

    List<CityCountResponse> out = new ArrayList<>();
    for (Map.Entry<String, Long> e : counts.entrySet()) {
      out.add(new CityCountResponse(e.getKey(), e.getValue()));
    }
    out.sort(Comparator.comparingLong(CityCountResponse::getCount).reversed());
    return out;
  }

  private List<ParkingUtilizationResponse> computeParkingUtilizationByCity() {
    List<ParkingSpot> spots = parkingSpotRepository.findAll();

    class Agg {
      int total;
      int available;
    }

    Map<String, Agg> byCity = new HashMap<>();
    for (ParkingSpot spot : spots) {
      String city = cityFromAddress(spot.getAddress());
      Agg agg = byCity.computeIfAbsent(city, k -> new Agg());
      agg.total += Math.max(0, spot.getTotalSpots());
      agg.available += Math.max(0, spot.getAvailableSpots());
    }

    List<ParkingUtilizationResponse> out = new ArrayList<>();
    for (Map.Entry<String, Agg> e : byCity.entrySet()) {
      int total = e.getValue().total;
      int available = e.getValue().available;
      double utilization = total <= 0 ? 0.0 : (1.0 - ((double) available / (double) total)) * 100.0;
      out.add(new ParkingUtilizationResponse(e.getKey(), total, available, round1(utilization)));
    }

    out.sort(Comparator.comparingDouble(ParkingUtilizationResponse::getUtilizationPercent).reversed());
    return out;
  }

  private TransitServiceSummaryResponse computeTransitSummary() {
    List<TransitRoute> active = transitRouteRepository.findByIsActiveTrue();
    long activeRoutes = active.size();

    long delayedRoutes = 0;
    long totalDelay = 0;
    long delayedCount = 0;

    long totalCapacity = 0;
    long capacityCount = 0;

    for (TransitRoute r : active) {
      int delay = r.getCurrentDelayMinutes();
      if (delay > 0) {
        delayedRoutes++;
        totalDelay += delay;
        delayedCount++;
      }

      totalCapacity += r.getCurrentCapacityPercent();
      capacityCount++;
    }

    double avgDelay = delayedCount == 0 ? 0.0 : ((double) totalDelay) / ((double) delayedCount);
    double avgCapacity = capacityCount == 0 ? 0.0 : ((double) totalCapacity) / ((double) capacityCount);

    return new TransitServiceSummaryResponse(
        activeRoutes,
        delayedRoutes,
        round1(avgDelay),
        round1(avgCapacity));
  }

  private double round1(double v) {
    return Math.round(v * 10.0) / 10.0;
  }

  private String normalizeCityLabel(String raw) {
    String s = raw.trim();
    if (s.isEmpty()) {
      return "Unknown";
    }
    // Prefer the rightmost comma-separated token: e.g. "Downtown Station, Montreal"
    // -> "Montreal"
    String[] parts = s.split(",");
    if (parts.length >= 2) {
      String last = parts[parts.length - 1].trim();
      if (!last.isEmpty()) {
        return titleCase(last);
      }
    }
    return titleCase(s);
  }

  private String cityFromAddress(String address) {
    if (address == null) {
      return "Unknown";
    }
    String s = address.trim();
    if (s.isEmpty()) {
      return "Unknown";
    }
    // Common format: "Street, City, Province" -> take City (second last)
    String[] parts = s.split(",");
    if (parts.length >= 2) {
      String candidate = parts[Math.max(0, parts.length - 2)].trim();
      if (!candidate.isEmpty()) {
        return titleCase(candidate);
      }
    }
    return "Unknown";
  }

  private String titleCase(String input) {
    String s = input.trim().toLowerCase(Locale.ROOT);
    if (s.isEmpty()) {
      return "Unknown";
    }
    return Character.toUpperCase(s.charAt(0)) + s.substring(1);
  }
}

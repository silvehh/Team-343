package com.team.summs_backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team.summs_backend.dto.RentalRequest;
import com.team.summs_backend.dto.RentalResponse;
import com.team.summs_backend.dto.ReturnRequest;
import com.team.summs_backend.exception.InvalidInputException;
import com.team.summs_backend.exception.RentalNotFoundException;
import com.team.summs_backend.exception.StationFullException;
import com.team.summs_backend.exception.VehicleNotAvailableException;
import com.team.summs_backend.exception.VehicleNotFoundException;
import com.team.summs_backend.model.AppUser;
import com.team.summs_backend.model.Rental;
import com.team.summs_backend.model.RentalStatus;
import com.team.summs_backend.model.Station;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.AppUserRepository;
import com.team.summs_backend.repository.RentalRepository;
import com.team.summs_backend.repository.StationRepository;
import com.team.summs_backend.repository.VehicleRepository;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final VehicleRepository vehicleRepository;
    private final AppUserRepository appUserRepository;
    private final StationRepository stationRepository;

    public RentalService(
        RentalRepository rentalRepository,
        VehicleRepository vehicleRepository,
        AppUserRepository appUserRepository,
        StationRepository stationRepository
    ) {
        this.rentalRepository = rentalRepository;
        this.vehicleRepository = vehicleRepository;
        this.appUserRepository = appUserRepository;
        this.stationRepository = stationRepository;
    }

    @Transactional
    public RentalResponse createRental(RentalRequest request) {
        if (request.userId() == null || request.vehicleId() == null) {
            throw new InvalidInputException("userId and vehicleId are required");
        }

        AppUser user = appUserRepository.findById(request.userId())
            .orElseThrow(() -> new InvalidInputException("User not found"));

        Vehicle vehicle = vehicleRepository.findById(request.vehicleId())
            .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found"));

        if (!vehicle.isAvailable()) {
            throw new VehicleNotAvailableException("Vehicle is not available for rental");
        }

        Station pickupStation = vehicle.getStation();
        if (pickupStation == null) {
            throw new VehicleNotAvailableException("Vehicle is not at a station");
        }

        vehicle.setAvailable(false);
        vehicle.setStation(null);
        vehicleRepository.save(vehicle);

        Rental rental = new Rental();
        rental.setUser(user);
        rental.setVehicle(vehicle);
        rental.setPickupStation(pickupStation);
        rental.setStatus(RentalStatus.ACTIVE);

        Rental saved = rentalRepository.save(rental);
        return toRentalResponse(saved);
    }

    @Transactional
    public RentalResponse returnRental(Long rentalId, ReturnRequest request) {
        if (request.userId() == null || request.stationId() == null) {
            throw new InvalidInputException("userId and stationId are required");
        }

        Rental rental = rentalRepository.findByIdAndUserId(rentalId, request.userId())
            .orElseThrow(() -> new RentalNotFoundException("Rental not found"));

        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new InvalidInputException("Rental has already been returned");
        }

        Station returnStation = stationRepository.findById(request.stationId())
            .orElseThrow(() -> new InvalidInputException("Station not found"));

        Vehicle vehicle = rental.getVehicle();
        VehicleType type = vehicle.getVehicleType();

        int capacity = getStationCapacityForType(returnStation, type);
        long currentCount = vehicleRepository.countByStationIdAndVehicleType(returnStation.getId(), type);

        if (currentCount >= capacity) {
            throw new StationFullException("Station " + returnStation.getName() + " is full for " + type.name().toLowerCase() + "s");
        }

        LocalDateTime now = LocalDateTime.now();
        long hoursElapsed = Math.max(1, Duration.between(rental.getStartTime(), now).toHours());
        BigDecimal totalCost = vehicle.getPricePerHour()
            .multiply(BigDecimal.valueOf(hoursElapsed))
            .setScale(2, RoundingMode.HALF_UP);

        rental.setEndTime(now);
        rental.setTotalCost(totalCost);
        rental.setStatus(RentalStatus.RETURNED);
        rental.setReturnStation(returnStation);

        vehicle.setStation(returnStation);
        vehicle.setAvailable(true);
        vehicleRepository.save(vehicle);

        Rental saved = rentalRepository.save(rental);
        return toRentalResponse(saved);
    }

    public List<RentalResponse> getUserRentals(Long userId, String statusParam) {
        if (userId == null) {
            throw new InvalidInputException("userId is required");
        }

        List<Rental> rentals;
        if (statusParam != null && !statusParam.isBlank()) {
            try {
                RentalStatus status = RentalStatus.valueOf(statusParam.trim().toUpperCase());
                rentals = rentalRepository.findByUserIdAndStatus(userId, status);
            } catch (IllegalArgumentException e) {
                throw new InvalidInputException("Invalid status: " + statusParam + ". Must be ACTIVE or RETURNED");
            }
        } else {
            rentals = rentalRepository.findByUserId(userId);
        }

        return rentals.stream()
            .map(this::toRentalResponse)
            .toList();
    }

    private int getStationCapacityForType(Station station, VehicleType type) {
        return switch (type) {
            case CAR -> station.getCarCapacity();
            case BIKE -> station.getBikeCapacity();
            case SCOOTER -> station.getScooterCapacity();
        };
    }

    private RentalResponse toRentalResponse(Rental rental) {
        return new RentalResponse(
            rental.getId(),
            rental.getVehicle().getId(),
            rental.getVehicle().getVehicleType().name(),
            rental.getVehicle().getProvider().getUsername(),
            rental.getStatus().name(),
            rental.getStartTime(),
            rental.getEndTime(),
            rental.getTotalCost(),
            rental.getPickupStation().getName(),
            rental.getReturnStation() != null ? rental.getReturnStation().getName() : null
        );
    }
}

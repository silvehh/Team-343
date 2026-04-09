package com.team.summs_backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team.summs_backend.dto.ProviderVehicleRequest;
import com.team.summs_backend.dto.VehicleResponse;
import com.team.summs_backend.exception.InvalidInputException;
import com.team.summs_backend.exception.StationFullException;
import com.team.summs_backend.exception.StationNotFoundException;
import com.team.summs_backend.exception.VehicleNotFoundException;
import com.team.summs_backend.model.MobilityProvider;
import com.team.summs_backend.model.Station;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.Rental;
import com.team.summs_backend.model.RentalStatus;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.MobilityProviderRepository;
import com.team.summs_backend.repository.RentalRepository;
import com.team.summs_backend.repository.StationRepository;
import com.team.summs_backend.repository.VehicleRepository;

@Service
public class ProviderVehicleService {

    private final VehicleRepository vehicleRepository;
    private final StationRepository stationRepository;
    private final MobilityProviderRepository mobilityProviderRepository;
    private final RentalRepository rentalRepository;

    public ProviderVehicleService(
            VehicleRepository vehicleRepository,
            StationRepository stationRepository,
            MobilityProviderRepository mobilityProviderRepository,
            RentalRepository rentalRepository) {
        this.vehicleRepository = vehicleRepository;
        this.stationRepository = stationRepository;
        this.mobilityProviderRepository = mobilityProviderRepository;
        this.rentalRepository = rentalRepository;
    }

    public List<VehicleResponse> getProviderVehicles(Long providerId) {
        validateProviderId(providerId);
        return vehicleRepository.findByProviderIdWithStation(providerId).stream()
                .map(this::toVehicleResponse)
                .toList();
    }

    @Transactional
    public VehicleResponse addVehicle(Long providerId, ProviderVehicleRequest request) {
        MobilityProvider provider = validateAndGetProvider(providerId);
        VehicleType vehicleType = parseAndValidateVehicleType(request.vehicleType(), provider);
        validatePricePerHour(request.pricePerHour());

        Station station = stationRepository.findById(request.stationId())
                .orElseThrow(() -> new StationNotFoundException("Station not found"));

        validateStationCapacity(station, vehicleType);

        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleType(vehicleType);
        vehicle.setProvider(provider);
        vehicle.setStation(station);
        vehicle.setAvailable(true);
        vehicle.setPricePerHour(request.pricePerHour());

        Vehicle saved = vehicleRepository.save(vehicle);
        return toVehicleResponse(saved);
    }

    @Transactional
    public VehicleResponse updateVehicle(Long providerId, Long vehicleId, ProviderVehicleRequest request) {
        MobilityProvider provider = validateAndGetProvider(providerId);

        Vehicle vehicle = vehicleRepository.findByIdAndProviderIdWithStation(vehicleId, providerId)
                .orElseThrow(
                        () -> new VehicleNotFoundException("Vehicle not found or does not belong to this provider"));

        VehicleType vehicleType = parseAndValidateVehicleType(request.vehicleType(), provider);
        validatePricePerHour(request.pricePerHour());

        Station station = stationRepository.findById(request.stationId())
                .orElseThrow(() -> new StationNotFoundException("Station not found"));

        // Only validate capacity if the station or type has changed
        boolean stationChanged = vehicle.getStation() == null || !vehicle.getStation().getId().equals(station.getId());
        boolean typeChanged = vehicle.getVehicleType() != vehicleType;

        if (stationChanged || typeChanged) {
            validateStationCapacity(station, vehicleType);
        }

        vehicle.setVehicleType(vehicleType);
        vehicle.setStation(station);
        vehicle.setPricePerHour(request.pricePerHour());

        Vehicle saved = vehicleRepository.save(vehicle);
        return toVehicleResponse(saved);
    }

    @Transactional
    public void deleteVehicle(Long providerId, Long vehicleId) {
        validateProviderId(providerId);

        Vehicle vehicle = vehicleRepository.findByIdAndProviderIdWithStation(vehicleId, providerId)
                .orElseThrow(
                        () -> new VehicleNotFoundException("Vehicle not found or does not belong to this provider"));

        if (!vehicle.isAvailable()) {
            throw new InvalidInputException("Cannot delete a vehicle that is currently rented out");
        }

        // Delete associated rentals first
        rentalRepository.deleteAll(rentalRepository.findByVehicleId(vehicleId));
        vehicleRepository.delete(vehicle);
    }

    @Transactional
    public VehicleResponse reclaimVehicle(Long providerId, Long vehicleId, ProviderVehicleRequest request) {
        validateProviderId(providerId);

        Vehicle vehicle = vehicleRepository.findByIdAndProviderIdWithStation(vehicleId, providerId)
                .orElseThrow(
                        () -> new VehicleNotFoundException("Vehicle not found or does not belong to this provider"));
        
        List<Rental> rentals = rentalRepository.findByProviderIdAndStatus(providerId, RentalStatus.ACTIVE);
        Rental activeRental = null;
        for(Rental rental : rentals) {
            if(rental.getVehicle() == vehicle) {
                activeRental = rental;
            }
        }
        Station returnStation = activeRental.getPickupStation();

        int capacity = getStationCapacityForType(returnStation, vehicle.getVehicleType());
        long currentCount = vehicleRepository.countByStationIdAndVehicleType(returnStation.getId(), vehicle.getVehicleType());

        if (currentCount >= capacity) { //if original pickup station is full, return vehicle to random station
            List<Station> allStations = stationRepository.findAll();
            for(Station station : allStations) {
                capacity = getStationCapacityForType(station, vehicle.getVehicleType());
                currentCount = vehicleRepository.countByStationIdAndVehicleType(station.getId(), vehicle.getVehicleType());
                if(currentCount < capacity) {
                    returnStation = station;
                    break;
                }
            }
        }

        LocalDateTime now = LocalDateTime.now();
        long hoursElapsed = Math.max(1, Duration.between(activeRental.getStartTime(), now).toHours());
        BigDecimal totalCost = vehicle.getPricePerHour()
            .multiply(BigDecimal.valueOf(hoursElapsed))
            .setScale(2, RoundingMode.HALF_UP);

        activeRental.setEndTime(now);
        activeRental.setTotalCost(totalCost);
        activeRental.setStatus(RentalStatus.RETURNED);
        activeRental.setReturnStation(returnStation);
        rentalRepository.save(activeRental);

        vehicle.setStation(returnStation);
        vehicle.setAvailable(true);
        
        Vehicle saved = vehicleRepository.save(vehicle);
        return toVehicleResponse(saved);

    }

    private int getStationCapacityForType(Station station, VehicleType type) {
        return switch (type) {
            case CAR -> station.getCarCapacity();
            case BIKE -> station.getBikeCapacity();
            case SCOOTER -> station.getScooterCapacity();
        };
    }

    private MobilityProvider validateAndGetProvider(Long providerId) {
        if (providerId == null) {
            throw new InvalidInputException("Provider ID is required");
        }
        return mobilityProviderRepository.findById(providerId)
                .orElseThrow(() -> new InvalidInputException("Mobility provider not found"));
    }

    private void validateProviderId(Long providerId) {
        if (providerId == null) {
            throw new InvalidInputException("Provider ID is required");
        }
        if (!mobilityProviderRepository.existsById(providerId)) {
            throw new InvalidInputException("Mobility provider not found");
        }
    }

    private VehicleType parseAndValidateVehicleType(String vehicleTypeParam, MobilityProvider provider) {
        if (vehicleTypeParam == null || vehicleTypeParam.isBlank()) {
            throw new InvalidInputException("Vehicle type is required");
        }

        VehicleType vehicleType;
        try {
            vehicleType = VehicleType.valueOf(vehicleTypeParam.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidInputException(
                    "Invalid vehicle type: " + vehicleTypeParam + ". Must be CAR, BIKE, or SCOOTER");
        }

        // Validate that the provider is allowed to add this type based on their
        // mobility options
        Set<String> allowedOptions = Arrays.stream(provider.getMobilityOptions().split(","))
                .map(String::trim)
                .collect(Collectors.toSet());

        String requiredOption = switch (vehicleType) {
            case CAR -> "Car";
            case BIKE -> "Bike";
            case SCOOTER -> "Scooter";
        };

        if (!allowedOptions.contains(requiredOption)) {
            throw new InvalidInputException(
                    "Your account is not registered to manage " + vehicleType.name().toLowerCase()
                            + " vehicles. Your mobility options are: " + provider.getMobilityOptions());
        }

        return vehicleType;
    }

    private void validatePricePerHour(BigDecimal pricePerHour) {
        if (pricePerHour == null) {
            throw new InvalidInputException("Price per hour is required");
        }
        if (pricePerHour.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidInputException("Price per hour must be greater than zero");
        }
    }

    private void validateStationCapacity(Station station, VehicleType type) {
        int capacity = switch (type) {
            case CAR -> station.getCarCapacity();
            case BIKE -> station.getBikeCapacity();
            case SCOOTER -> station.getScooterCapacity();
        };

        long currentCount = vehicleRepository.countByStationIdAndVehicleType(station.getId(), type);

        if (currentCount >= capacity) {
            throw new StationFullException(
                    "Station " + station.getName() + " is full for " + type.name().toLowerCase() + "s" +
                            " (capacity: " + capacity + ", current: " + currentCount + ")");
        }
    }

    private VehicleResponse toVehicleResponse(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getVehicleType().name(),
                vehicle.getProvider().getUsername(),
                vehicle.getProvider().getId(),
                vehicle.getPricePerHour(),
                vehicle.getStation() != null ? vehicle.getStation().getId() : null,
                vehicle.getStation() != null ? vehicle.getStation().getName() : null);
    }
}

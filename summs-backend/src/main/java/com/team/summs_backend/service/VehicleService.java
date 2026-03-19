package com.team.summs_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.team.summs_backend.dto.VehicleResponse;
import com.team.summs_backend.exception.InvalidInputException;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.VehicleRepository;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<VehicleResponse> getAvailableVehicles(String vehicleTypeParam, Long stationId) {
        List<Vehicle> vehicles;

        VehicleType vehicleType = parseVehicleType(vehicleTypeParam);

        if (stationId != null && vehicleType != null) {
            vehicles = vehicleRepository.findByStationIdAndVehicleTypeAvailableWithJoins(stationId, vehicleType);
        } else if (stationId != null) {
            vehicles = vehicleRepository.findByStationIdAvailableWithJoins(stationId);
        } else if (vehicleType != null) {
            vehicles = vehicleRepository.findByVehicleTypeAvailableWithJoins(vehicleType);
        } else {
            vehicles = vehicleRepository.findAvailableWithJoins();
        }

        return vehicles.stream()
            .map(this::toVehicleResponse)
            .toList();
    }

    private VehicleType parseVehicleType(String vehicleTypeParam) {
        if (vehicleTypeParam == null || vehicleTypeParam.isBlank()) {
            return null;
        }
        try {
            return VehicleType.valueOf(vehicleTypeParam.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidInputException("Invalid vehicle type: " + vehicleTypeParam + ". Must be CAR, BIKE, or SCOOTER");
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
            vehicle.getStation() != null ? vehicle.getStation().getName() : null
        );
    }
}

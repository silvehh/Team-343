package com.team.summs_backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.team.summs_backend.dto.StationRequest;
import com.team.summs_backend.dto.StationResponse;
import com.team.summs_backend.exception.InvalidInputException;
import com.team.summs_backend.exception.StationNotFoundException;
import com.team.summs_backend.model.Station;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.repository.RentalRepository;
import com.team.summs_backend.repository.StationRepository;
import com.team.summs_backend.repository.VehicleRepository;

@Service
public class StationService {

    private final StationRepository stationRepository;
    private final VehicleRepository vehicleRepository;
    private final RentalRepository rentalRepository;

    public StationService(StationRepository stationRepository, VehicleRepository vehicleRepository, RentalRepository rentalRepository) {
        this.stationRepository = stationRepository;
        this.vehicleRepository = vehicleRepository;
        this.rentalRepository = rentalRepository;
    }

    public List<StationResponse> getAllStations() {
        List<Station> stations = stationRepository.findAll();

        // Single query to get all counts grouped by station and type
        Map<Long, Map<VehicleType, Long>> countsMap = new HashMap<>();
        for (Object[] row : vehicleRepository.countAvailableGroupedByStationAndType()) {
            Long stationId = (Long) row[0];
            VehicleType type = (VehicleType) row[1];
            Long count = (Long) row[2];
            countsMap.computeIfAbsent(stationId, k -> new HashMap<>()).put(type, count);
        }

        return stations.stream()
            .map(station -> toStationResponse(station, countsMap.getOrDefault(station.getId(), Map.of())))
            .toList();
    }

    public StationResponse createStation(StationRequest request) {
        validateStationRequest(request);

        Station station = new Station();
        station.setName(request.name().trim());
        station.setLatitude(request.latitude());
        station.setLongitude(request.longitude());
        station.setCarCapacity(request.carCapacity());
        station.setBikeCapacity(request.bikeCapacity());
        station.setScooterCapacity(request.scooterCapacity());

        Station saved = stationRepository.save(station);
        return toStationResponse(saved, Map.of());
    }

    public StationResponse updateStation(Long id, StationRequest request) {
        validateStationRequest(request);

        Station station = stationRepository.findById(id)
            .orElseThrow(() -> new StationNotFoundException("Station not found"));

        long currentCars = vehicleRepository.countByStationIdAndVehicleType(id, VehicleType.CAR);
        long currentBikes = vehicleRepository.countByStationIdAndVehicleType(id, VehicleType.BIKE);
        long currentScooters = vehicleRepository.countByStationIdAndVehicleType(id, VehicleType.SCOOTER);

        if (request.carCapacity() < currentCars) {
            throw new InvalidInputException("Car capacity cannot be less than the " + currentCars + " cars currently at this station");
        }
        if (request.bikeCapacity() < currentBikes) {
            throw new InvalidInputException("Bike capacity cannot be less than the " + currentBikes + " bikes currently at this station");
        }
        if (request.scooterCapacity() < currentScooters) {
            throw new InvalidInputException("Scooter capacity cannot be less than the " + currentScooters + " scooters currently at this station");
        }

        station.setName(request.name().trim());
        station.setLatitude(request.latitude());
        station.setLongitude(request.longitude());
        station.setCarCapacity(request.carCapacity());
        station.setBikeCapacity(request.bikeCapacity());
        station.setScooterCapacity(request.scooterCapacity());

        Station saved = stationRepository.save(station);

        Map<Long, Map<VehicleType, Long>> countsMap = new HashMap<>();
        for (Object[] row : vehicleRepository.countAvailableGroupedByStationAndType()) {
            Long stationId = (Long) row[0];
            VehicleType type = (VehicleType) row[1];
            Long count = (Long) row[2];
            countsMap.computeIfAbsent(stationId, k -> new HashMap<>()).put(type, count);
        }

        return toStationResponse(saved, countsMap.getOrDefault(saved.getId(), Map.of()));
    }

    @Transactional
    public void deleteStation(Long id) {
        if (!stationRepository.existsById(id)) {
            throw new StationNotFoundException("Station not found");
        }

        // Delete rentals for vehicles at this station
        List<Vehicle> vehicles = vehicleRepository.findByStationId(id);
        for (Vehicle vehicle : vehicles) {
            rentalRepository.deleteAll(rentalRepository.findByVehicleId(vehicle.getId()));
        }

        // Delete rentals that reference this station as pickup or return
        rentalRepository.deleteAll(rentalRepository.findByPickupStationId(id));
        rentalRepository.deleteAll(rentalRepository.findByReturnStationId(id));

        // Delete vehicles at this station
        vehicleRepository.deleteAll(vehicles);

        stationRepository.deleteById(id);
    }

    private void validateStationRequest(StationRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new InvalidInputException("Station name is required");
        }
        if (request.carCapacity() < 0 || request.bikeCapacity() < 0 || request.scooterCapacity() < 0) {
            throw new InvalidInputException("Capacity values must not be negative");
        }
    }

    private StationResponse toStationResponse(Station station, Map<VehicleType, Long> counts) {
        return new StationResponse(
            station.getId(),
            station.getName(),
            station.getLatitude(),
            station.getLongitude(),
            station.getCarCapacity(),
            station.getBikeCapacity(),
            station.getScooterCapacity(),
            counts.getOrDefault(VehicleType.CAR, 0L),
            counts.getOrDefault(VehicleType.BIKE, 0L),
            counts.getOrDefault(VehicleType.SCOOTER, 0L)
        );
    }
}

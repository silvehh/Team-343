package com.team.summs_backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.team.summs_backend.dto.StationResponse;
import com.team.summs_backend.model.Station;
import com.team.summs_backend.model.VehicleType;
import com.team.summs_backend.repository.StationRepository;
import com.team.summs_backend.repository.VehicleRepository;

@Service
public class StationService {

    private final StationRepository stationRepository;
    private final VehicleRepository vehicleRepository;

    public StationService(StationRepository stationRepository, VehicleRepository vehicleRepository) {
        this.stationRepository = stationRepository;
        this.vehicleRepository = vehicleRepository;
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

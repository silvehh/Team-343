package com.team.summs_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.team.summs_backend.dto.ParkingSpotResponse;
import com.team.summs_backend.model.ParkingSpot;
import com.team.summs_backend.repository.ParkingSpotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ParkingService {

    private final ParkingSpotRepository parkingSpotRepository;

    public List<ParkingSpotResponse> getAllParkingSpots() {
        return parkingSpotRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ParkingSpotResponse> getAvailableParkingSpots() {
        return parkingSpotRepository.findByAvailableSpotsGreaterThan(0).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ParkingSpotResponse> getParkingSpotsByType(String type) {
        ParkingSpot.ParkingType parkingType = ParkingSpot.ParkingType.valueOf(type.toUpperCase());
        return parkingSpotRepository.findByParkingType(parkingType).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ParkingSpotResponse toResponse(ParkingSpot spot) {
        return new ParkingSpotResponse(
                spot.getId(),
                spot.getName(),
                spot.getAddress(),
                spot.getLatitude(),
                spot.getLongitude(),
                spot.getParkingType().name(),
                spot.getTotalSpots(),
                spot.getAvailableSpots(),
                spot.getPricePerHour(),
                spot.getStatus().name(),
                spot.getOperatingHours(),
                spot.isHasEvCharging(),
                spot.isHasDisabledAccess()
        );
    }
}

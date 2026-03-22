package com.team.summs_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team.summs_backend.dto.ParkingSpotResponse;
import com.team.summs_backend.service.ParkingService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/parking")
@RequiredArgsConstructor
@Tag(name = "Parking", description = "Parking management endpoints")
public class ParkingController {

    private final ParkingService parkingService;

    @GetMapping
    @Operation(summary = "Get all parking spots")
    public ResponseEntity<List<ParkingSpotResponse>> getAllParkingSpots(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean availableOnly) {
        
        List<ParkingSpotResponse> spots;
        
        if (type != null) {
            spots = parkingService.getParkingSpotsByType(type);
        } else if (Boolean.TRUE.equals(availableOnly)) {
            spots = parkingService.getAvailableParkingSpots();
        } else {
            spots = parkingService.getAllParkingSpots();
        }
        
        return ResponseEntity.ok(spots);
    }
}

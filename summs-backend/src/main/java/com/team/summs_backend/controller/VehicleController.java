package com.team.summs_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team.summs_backend.dto.VehicleResponse;
import com.team.summs_backend.service.VehicleService;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAvailableVehicles(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) Long stationId
    ) {
        return ResponseEntity.ok(vehicleService.getAvailableVehicles(type, stationId));
    }
}

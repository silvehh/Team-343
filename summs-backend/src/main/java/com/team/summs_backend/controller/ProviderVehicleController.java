package com.team.summs_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.summs_backend.dto.ProviderVehicleRequest;
import com.team.summs_backend.dto.RentalResponse;
import com.team.summs_backend.dto.VehicleResponse;
import com.team.summs_backend.exception.UnauthorizedException;
import com.team.summs_backend.service.ProviderVehicleService;

@RestController
@RequestMapping("/api/provider/vehicles")
public class ProviderVehicleController {

    private final ProviderVehicleService providerVehicleService;

    public ProviderVehicleController(ProviderVehicleService providerVehicleService) {
        this.providerVehicleService = providerVehicleService;
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getProviderVehicles(
            @RequestHeader("X-Account-Type") String accountType,
            @RequestHeader("X-User-Id") Long providerId) {
        requireProvider(accountType);
        return ResponseEntity.ok(providerVehicleService.getProviderVehicles(providerId));
    }

    @PostMapping
    public ResponseEntity<VehicleResponse> addVehicle(
            @RequestHeader("X-Account-Type") String accountType,
            @RequestHeader("X-User-Id") Long providerId,
            @RequestBody ProviderVehicleRequest request) {
        requireProvider(accountType);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(providerVehicleService.addVehicle(providerId, request));
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @RequestHeader("X-Account-Type") String accountType,
            @RequestHeader("X-User-Id") Long providerId,
            @PathVariable Long vehicleId,
            @RequestBody ProviderVehicleRequest request) {
        requireProvider(accountType);
        return ResponseEntity.ok(providerVehicleService.updateVehicle(providerId, vehicleId, request));
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(
            @RequestHeader("X-Account-Type") String accountType,
            @RequestHeader("X-User-Id") Long providerId,
            @PathVariable Long vehicleId) {
        requireProvider(accountType);
        providerVehicleService.deleteVehicle(providerId, vehicleId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{vehicleId}/reclaim")
    public ResponseEntity<VehicleResponse> reclaimVehicle(
            @RequestHeader("X-Account-Type") String accountType,
            @RequestHeader("X-User-Id") Long providerId,
            @PathVariable Long vehicleId,
            @RequestBody ProviderVehicleRequest request) {
        requireProvider(accountType);
        return ResponseEntity.ok(providerVehicleService.reclaimVehicle(providerId, vehicleId, request));
    }

    private void requireProvider(String accountType) {
        if (!"MOBILITY_PROVIDER".equalsIgnoreCase(accountType)) {
            throw new UnauthorizedException("Mobility provider access required");
        }
    }
}

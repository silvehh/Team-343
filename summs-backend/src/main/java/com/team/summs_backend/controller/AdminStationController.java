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

import com.team.summs_backend.dto.StationRequest;
import com.team.summs_backend.dto.StationResponse;
import com.team.summs_backend.exception.UnauthorizedException;
import com.team.summs_backend.service.StationService;

@RestController
@RequestMapping("/api/admin/stations")
public class AdminStationController {

    private final StationService stationService;

    public AdminStationController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping
    public ResponseEntity<List<StationResponse>> getAllStations(
            @RequestHeader("X-Account-Type") String accountType) {
        requireAdmin(accountType);
        return ResponseEntity.ok(stationService.getAllStations());
    }

    @PostMapping
    public ResponseEntity<StationResponse> createStation(
            @RequestHeader("X-Account-Type") String accountType,
            @RequestBody StationRequest request) {
        requireAdmin(accountType);
        return ResponseEntity.status(HttpStatus.CREATED).body(stationService.createStation(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StationResponse> updateStation(
            @RequestHeader("X-Account-Type") String accountType,
            @PathVariable Long id,
            @RequestBody StationRequest request) {
        requireAdmin(accountType);
        return ResponseEntity.ok(stationService.updateStation(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStation(
            @RequestHeader("X-Account-Type") String accountType,
            @PathVariable Long id) {
        requireAdmin(accountType);
        stationService.deleteStation(id);
        return ResponseEntity.noContent().build();
    }

    private void requireAdmin(String accountType) {
        if (!"ADMIN".equalsIgnoreCase(accountType)) {
            throw new UnauthorizedException("Admin access required");
        }
    }
}

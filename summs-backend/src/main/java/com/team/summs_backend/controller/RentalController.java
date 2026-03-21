package com.team.summs_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team.summs_backend.dto.RentalRequest;
import com.team.summs_backend.dto.RentalResponse;
import com.team.summs_backend.dto.ReturnRequest;
import com.team.summs_backend.service.RentalService;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @PostMapping
    public ResponseEntity<RentalResponse> createRental(@RequestBody RentalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rentalService.createRental(request));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<RentalResponse> returnRental(
        @PathVariable Long id,
        @RequestBody ReturnRequest request
    ) {
        return ResponseEntity.ok(rentalService.returnRental(id, request));
    }

    @GetMapping
    public ResponseEntity<List<RentalResponse>> getUserRentals(
        @RequestParam Long userId,
        @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(rentalService.getUserRentals(userId, status));
    }
}

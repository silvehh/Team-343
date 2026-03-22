package com.team.summs_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team.summs_backend.dto.TransitRouteResponse;
import com.team.summs_backend.dto.TransitStopResponse;
import com.team.summs_backend.service.TransitService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/transit")
@RequiredArgsConstructor
@Tag(name = "Transit", description = "Public transportation endpoints")
public class TransitController {

    private final TransitService transitService;

    @GetMapping("/routes")
    @Operation(summary = "Get all transit routes")
    public ResponseEntity<List<TransitRouteResponse>> getAllRoutes(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean activeOnly) {
        
        List<TransitRouteResponse> routes;
        
        if (type != null) {
            routes = transitService.getRoutesByType(type);
        } else if (Boolean.TRUE.equals(activeOnly)) {
            routes = transitService.getActiveRoutes();
        } else {
            routes = transitService.getAllRoutes();
        }
        
        return ResponseEntity.ok(routes);
    }

    @GetMapping("/routes/{routeId}/stops")
    @Operation(summary = "Get stops for a specific route")
    public ResponseEntity<List<TransitStopResponse>> getStopsByRoute(@PathVariable Long routeId) {
        return ResponseEntity.ok(transitService.getStopsByRoute(routeId));
    }
}

package com.team.summs_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.team.summs_backend.dto.TransitRouteResponse;
import com.team.summs_backend.dto.TransitStopResponse;
import com.team.summs_backend.model.TransitRoute;
import com.team.summs_backend.model.TransitStop;
import com.team.summs_backend.repository.TransitRouteRepository;
import com.team.summs_backend.repository.TransitStopRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransitService {

    private final TransitRouteRepository transitRouteRepository;
    private final TransitStopRepository transitStopRepository;

    public List<TransitRouteResponse> getAllRoutes() {
        return transitRouteRepository.findAll().stream()
                .map(this::toRouteResponse)
                .collect(Collectors.toList());
    }

    public List<TransitRouteResponse> getActiveRoutes() {
        return transitRouteRepository.findByIsActiveTrue().stream()
                .map(this::toRouteResponse)
                .collect(Collectors.toList());
    }

    public List<TransitRouteResponse> getRoutesByType(String type) {
        TransitRoute.TransitType transitType = TransitRoute.TransitType.valueOf(type.toUpperCase());
        return transitRouteRepository.findByTransitType(transitType).stream()
                .map(this::toRouteResponse)
                .collect(Collectors.toList());
    }

    public List<TransitStopResponse> getStopsByRoute(Long routeId) {
        return transitStopRepository.findByRouteIdOrderByStopOrderAsc(routeId).stream()
                .map(this::toStopResponse)
                .collect(Collectors.toList());
    }

    private TransitRouteResponse toRouteResponse(TransitRoute route) {
        return new TransitRouteResponse(
                route.getId(),
                route.getRouteNumber(),
                route.getRouteName(),
                route.getTransitType().name(),
                route.getStartStation(),
                route.getEndStation(),
                route.getFrequencyMinutes(),
                route.getCurrentDelayMinutes(),
                route.getCurrentCapacityPercent(),
                route.getReliabilityScore(),
                route.getOperatingHours(),
                route.isActive()
        );
    }

    private TransitStopResponse toStopResponse(TransitStop stop) {
        return new TransitStopResponse(
                stop.getId(),
                stop.getName(),
                stop.getLatitude(),
                stop.getLongitude(),
                stop.getRoute().getId(),
                stop.getRoute().getRouteNumber(),
                stop.getStopOrder(),
                stop.getNextArrival()
        );
    }
}

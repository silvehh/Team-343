package com.team.summs_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team.summs_backend.model.TransitStop;

@Repository
public interface TransitStopRepository extends JpaRepository<TransitStop, Long> {
    List<TransitStop> findByRouteIdOrderByStopOrderAsc(Long routeId);
}

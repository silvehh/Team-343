package com.team.summs_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team.summs_backend.model.TransitRoute;
import com.team.summs_backend.model.TransitRoute.TransitType;

@Repository
public interface TransitRouteRepository extends JpaRepository<TransitRoute, Long> {
    List<TransitRoute> findByTransitType(TransitType transitType);
    List<TransitRoute> findByIsActiveTrue();
    List<TransitRoute> findByReliabilityScoreGreaterThanEqual(int minScore);
}

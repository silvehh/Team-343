package com.team.summs_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team.summs_backend.model.ParkingSpot;
import com.team.summs_backend.model.ParkingSpot.ParkingStatus;
import com.team.summs_backend.model.ParkingSpot.ParkingType;

@Repository
public interface ParkingSpotRepository extends JpaRepository<ParkingSpot, Long> {
    List<ParkingSpot> findByStatus(ParkingStatus status);
    List<ParkingSpot> findByParkingType(ParkingType parkingType);
    List<ParkingSpot> findByAvailableSpotsGreaterThan(int minSpots);
}

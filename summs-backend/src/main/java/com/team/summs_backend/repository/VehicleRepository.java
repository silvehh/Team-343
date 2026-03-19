package com.team.summs_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.team.summs_backend.model.Vehicle;
import com.team.summs_backend.model.VehicleType;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    @Query("SELECT v FROM Vehicle v JOIN FETCH v.provider LEFT JOIN FETCH v.station WHERE v.available = true")
    List<Vehicle> findAvailableWithJoins();

    @Query("SELECT v FROM Vehicle v JOIN FETCH v.provider LEFT JOIN FETCH v.station WHERE v.available = true AND v.station.id = :stationId")
    List<Vehicle> findByStationIdAvailableWithJoins(Long stationId);

    @Query("SELECT v FROM Vehicle v JOIN FETCH v.provider LEFT JOIN FETCH v.station WHERE v.available = true AND v.vehicleType = :vehicleType")
    List<Vehicle> findByVehicleTypeAvailableWithJoins(VehicleType vehicleType);

    @Query("SELECT v FROM Vehicle v JOIN FETCH v.provider LEFT JOIN FETCH v.station WHERE v.available = true AND v.station.id = :stationId AND v.vehicleType = :vehicleType")
    List<Vehicle> findByStationIdAndVehicleTypeAvailableWithJoins(Long stationId, VehicleType vehicleType);

    long countByStationIdAndVehicleType(Long stationId, VehicleType vehicleType);

    @Query("SELECT v.station.id, v.vehicleType, COUNT(v) FROM Vehicle v WHERE v.station IS NOT NULL AND v.available = true GROUP BY v.station.id, v.vehicleType")
    List<Object[]> countAvailableGroupedByStationAndType();

    List<Vehicle> findByStationId(Long stationId);
}

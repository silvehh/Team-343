package com.team.summs_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team.summs_backend.model.Station;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
}

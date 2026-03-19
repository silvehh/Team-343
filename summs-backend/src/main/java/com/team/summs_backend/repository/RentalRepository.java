package com.team.summs_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team.summs_backend.model.Rental;
import com.team.summs_backend.model.RentalStatus;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    List<Rental> findByUserId(Long userId);

    List<Rental> findByUserIdAndStatus(Long userId, RentalStatus status);

    Optional<Rental> findByIdAndUserId(Long id, Long userId);
}

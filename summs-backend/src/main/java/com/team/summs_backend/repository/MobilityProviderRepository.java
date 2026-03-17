package com.team.summs_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.team.summs_backend.model.MobilityProvider;

@Repository
public interface MobilityProviderRepository extends JpaRepository<MobilityProvider, Long> {
    Optional<MobilityProvider> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
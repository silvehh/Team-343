package com.team.summs_backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "parking_spots")
public class ParkingSpot {

    public enum ParkingType {
        STREET, GARAGE, LOT
    }

    public enum ParkingStatus {
        AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParkingType parkingType;

    @Column(nullable = false)
    private int totalSpots;

    @Column(nullable = false)
    private int availableSpots;

    @Column(nullable = false)
    private double pricePerHour;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParkingStatus status;

    @Column
    private String operatingHours;

    @Column
    private boolean hasEvCharging;

    @Column
    private boolean hasDisabledAccess;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

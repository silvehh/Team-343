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
@Table(name = "transit_routes")
public class TransitRoute {

    public enum TransitType {
        BUS, METRO, TRAIN, REM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String routeNumber;

    @Column(nullable = false)
    private String routeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransitType transitType;

    @Column(nullable = false)
    private String startStation;

    @Column(nullable = false)
    private String endStation;

    @Column(nullable = false)
    private int frequencyMinutes;

    @Column(nullable = false)
    private int currentDelayMinutes;

    @Column(nullable = false)
    private int currentCapacityPercent;

    @Column(nullable = false)
    private int reliabilityScore;

    @Column
    private String operatingHours;

    @Column(nullable = false)
    private boolean isActive;

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

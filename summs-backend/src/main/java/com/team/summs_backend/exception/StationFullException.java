package com.team.summs_backend.exception;

public class StationFullException extends RuntimeException {
    public StationFullException(String message) {
        super(message);
    }
}

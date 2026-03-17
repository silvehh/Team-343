package com.team.summs_backend.exception;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        String message = ex.getReason() != null && !ex.getReason().isBlank()
            ? ex.getReason()
            : "Request failed";

        return ResponseEntity
            .status(ex.getStatusCode())
            .body(Map.of("message", message));
    }
}

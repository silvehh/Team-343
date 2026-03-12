package com.team.summs_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.summs_backend.dto.SampleDTO;

@RestController
public class SampleController {

    @GetMapping("/sample")
    public SampleDTO getSample() {
        SampleDTO dto = new SampleDTO();
        dto.setMyLong(123L);
        dto.setMyString("hello");
        return dto;
    }
}
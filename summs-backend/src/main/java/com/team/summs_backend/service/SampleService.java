package com.team.summs_backend.service;

import com.team.summs_backend.dto.SampleDTO;
import com.team.summs_backend.model.Sample;
import com.team.summs_backend.repository.SampleRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SampleService {

    private final SampleRepository sampleRepository;

    public SampleService(SampleRepository sampleRepository) {
        this.sampleRepository = sampleRepository;
    }

    public Sample saveSample(SampleDTO dto) {
        Sample sample = new Sample(dto.getMyLong(), dto.getMyString());
        return sampleRepository.save(sample);
    }

    public Optional<Sample> findById(Long id) {
        return sampleRepository.findById(id);
    }
}

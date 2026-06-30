package com.hotelreservation.hotelservice.service;

import com.hotelreservation.hotelservice.dto.HotelserviceRequests.CreateServiceRequest;
import com.hotelreservation.hotelservice.dto.HotelserviceRequests.UpdateServiceRequest;
import com.hotelreservation.hotelservice.dto.HotelserviceResponses.HotelServiceResponse;
import com.hotelreservation.hotelservice.entity.HotelService;
import com.hotelreservation.hotelservice.mapper.HotelserviceMapper;
import com.hotelreservation.hotelservice.repository.HotelServiceRepository;
import com.hotelreservation.hotelservice.service.HotelServiceManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HotelServiceManagerImpl implements HotelServiceManager {
    @Autowired private HotelServiceRepository serRepo;

    @Override
    public HotelServiceResponse create(CreateServiceRequest rq) {
        serRepo.insertService(rq.getName(), rq.getPrice(), rq.getStatus());
        HotelService s = serRepo.findByName(rq.getName())
            .orElseThrow(() -> new IllegalArgumentException("HotelService not found"));
        return HotelserviceMapper.toResponse(s);
    }

    @Override
    @Transactional(readOnly = true)
    public HotelServiceResponse getByName(String name) {
        HotelService s = serRepo.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("HotelService not found"));
        return HotelserviceMapper.toResponse(s);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HotelServiceResponse> getAllService() {
        return serRepo.takeAll().stream()
            .map(HotelserviceMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    public HotelServiceResponse update(String name, UpdateServiceRequest rq) {
        serRepo.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("HotelService not found"));
        serRepo.updateService(name, rq.getPrice(), rq.getStatus());
        HotelService updated = serRepo.findByName(name)
            .orElseThrow(() -> new IllegalStateException("Cannot load service after update"));
        return HotelserviceMapper.toResponse(updated);
    }

    @Override
    public void delete(String name) {
        serRepo.deleteSer(name);
    }
}

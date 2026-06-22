package com.hotelreservation.modules.room.service.impl;

import static com.hotelreservation.modules.room.dto.RoomRequests.*;
import static com.hotelreservation.modules.room.dto.RoomResponses.*;
import com.hotelreservation.modules.room.entity.RoomType;
import com.hotelreservation.modules.room.mapper.RoomMapper;
import com.hotelreservation.modules.room.repository.RoomTypeRepository;
import com.hotelreservation.modules.room.service.RoomTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomTypeServiceImpl implements RoomTypeService {
    @Autowired private RoomTypeRepository roomTypeRepo;

    @Override
    public RoomTypeResponse create(CreateRoomTypeRequest rq) {
        roomTypeRepo.insertRoomType(rq.getName(), rq.getCapacity(), 
                    rq.getBasePrice(), rq.getDescription());
        RoomType rt = roomTypeRepo.findByName(rq.getName())
            .orElseThrow(() -> new IllegalStateException("Cannot load roomType after insert"));
        return RoomMapper.toTypeResponse(rt);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomTypeResponse> getAll() {
        return roomTypeRepo.takeAll().stream().map(RoomMapper::toTypeResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomTypeResponse getByName(String name) {
        RoomType rt = roomTypeRepo.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found: " + name));
        return RoomMapper.toTypeResponse(rt);
    }

    @Override
    public RoomTypeResponse update(String name, UpdateRoomTypeRequest rq) {
        roomTypeRepo.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found: " + name));
        roomTypeRepo.updateRoomType(name, rq.getName(), rq.getCapacity(), rq.getBasePrice(), rq.getDescription());
        
        RoomType rt = roomTypeRepo.findByName(rq.getName())
            .orElseThrow(() -> new IllegalArgumentException("Cannot load roomType after updated"));

        return RoomMapper.toTypeResponse(rt);
    }

    @Override
    public void delete(String name) {
        roomTypeRepo.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found: " + name));
        roomTypeRepo.deleteByName(name);
    }
}

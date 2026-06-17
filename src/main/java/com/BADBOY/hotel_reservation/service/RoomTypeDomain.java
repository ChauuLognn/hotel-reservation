package com.BADBOY.hotel_reservation.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.BADBOY.hotel_reservation.dto.Room.RoomTypeCreateRequest;
import com.BADBOY.hotel_reservation.dto.Room.RoomTypeDto;
import com.BADBOY.hotel_reservation.entity.RoomType;
import com.BADBOY.hotel_reservation.repository.RoomTypeRepository;

@Service
@Transactional
public class RoomTypeDomain {
    @Autowired private RoomTypeRepository roomTypeRepo;

    public RoomTypeDto create(RoomTypeCreateRequest rq){
        roomTypeRepo.insertRoomType(rq.getName(), rq.getCapacity(), 
                    rq.getBasePrice(), rq.getDescription());
        RoomType rt = roomTypeRepo.findByName(rq.getName())
            .orElseThrow(() -> new IllegalStateException("Cannot load roomType after insert"));
        return RoomTypeDto.fromEntity(rt);
    }

    @Transactional
    public List<RoomTypeDto> getAll(){
        return roomTypeRepo.takeAll().stream().map(RoomTypeDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public RoomTypeDto getByName(String name){
        RoomType rt = roomTypeRepo.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found: " + name));
        return RoomTypeDto.fromEntity(rt);
    }

    public RoomTypeDto update(String name, RoomTypeCreateRequest rq){
        roomTypeRepo.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found: "+name));
        roomTypeRepo.updateRoomType(name, rq.getName(), rq.getCapacity(), rq.getBasePrice(), rq.getDescription());
        
        RoomType rt = roomTypeRepo.findByName(rq.getName())
            .orElseThrow(() -> new IllegalArgumentException("Cannot load roomType after updated"));

        return RoomTypeDto.fromEntity(rt);
    }

    public void delete(String name){
        roomTypeRepo.findByName(name)
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found: " + name));
        roomTypeRepo.deleteByName(name);
    }
}

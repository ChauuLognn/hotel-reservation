package com.hotelreservation.module.room.service.impl;

import com.hotelreservation.module.room.dto.request.CreateRoomRequest;
import com.hotelreservation.module.room.dto.request.UpdateRoomRequest;
import com.hotelreservation.module.room.dto.response.AvailableRoomResponse;
import com.hotelreservation.module.room.dto.response.RoomResponse;
import com.hotelreservation.module.room.entity.Room;
import com.hotelreservation.module.room.entity.RoomType;
import com.hotelreservation.module.room.mapper.RoomMapper;
import com.hotelreservation.module.room.repository.RoomRepository;
import com.hotelreservation.module.room.repository.RoomTypeRepository;
import com.hotelreservation.module.room.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomServiceImpl implements RoomService {
    @Autowired private RoomRepository roomRepo;
    @Autowired private RoomTypeRepository rtRepo;

    @Override
    public List<AvailableRoomResponse> findAvailable(
        String roomTypeName, LocalDate checkIn, LocalDate checkOut
    ) {
        String effectiveRoomTypeName = null;
        Byte safeMinCapacity = null;

        if (roomTypeName != null && !roomTypeName.isBlank()) {
            RoomType rt = rtRepo.findByName(roomTypeName)
                .orElseThrow(() -> new IllegalArgumentException("no room has that name: " + roomTypeName));
            effectiveRoomTypeName = roomTypeName;
            Byte minCapacity = rt.getCapacity();
            safeMinCapacity = (minCapacity == null) ? 0 : minCapacity;
        }

        return roomRepo.findAvailableRooms(checkIn, checkOut, effectiveRoomTypeName, safeMinCapacity);
    }

    @Override
    public RoomResponse create(CreateRoomRequest rq) {
        if (roomRepo.findRoom(rq.getId()).isPresent()) {
            throw new IllegalArgumentException("Số phòng này đã tồn tại.");
        }
        RoomType rt = rtRepo.findByName(rq.getTypeName())
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found: " + rq.getTypeName()));

        roomRepo.insertRoom(rq.getId(), rt.getId(), rq.getStatus());
        Room room = roomRepo.findRoom(rq.getId())
            .orElseThrow(() -> new IllegalStateException("Insert error: Cannot reload Room"));
        return RoomMapper.toResponse(room);  
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAll() {
        return roomRepo.takeAll().stream()
            .map(RoomMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getById(Integer id) {
        Room r = roomRepo.findRoom(id)
            .orElseThrow(() -> new IllegalArgumentException("Room not found: " + id));
        return RoomMapper.toResponse(r);
    }
    
    @Override
    public RoomResponse update(Integer id, UpdateRoomRequest rq) {
        roomRepo.findRoom(id)
            .orElseThrow(() -> new IllegalArgumentException("Room not found: " + id));

        RoomType rt = rtRepo.findByName(rq.getTypeName())
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found: " + rq.getTypeName()));

        roomRepo.updateRoom(id, rt.getId(), rq.getStatus());

        Room updated = roomRepo.findRoom(id)
            .orElseThrow(() -> new IllegalStateException("Cannot reload room after update"));

        return RoomMapper.toResponse(updated);
    }

    @Override
    public void delete(Integer id) {
        roomRepo.findRoom(id)
            .orElseThrow(() -> new IllegalArgumentException("Room not found: " + id));
        roomRepo.deleteRoom(id);
    }
}

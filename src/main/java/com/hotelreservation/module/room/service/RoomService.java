package com.hotelreservation.module.room.service;

import com.hotelreservation.module.room.dto.request.CreateRoomRequest;
import com.hotelreservation.module.room.dto.request.UpdateRoomRequest;
import com.hotelreservation.module.room.dto.response.AvailableRoomResponse;
import com.hotelreservation.module.room.dto.response.RoomResponse;
import java.time.LocalDate;
import java.util.List;

public interface RoomService {
    RoomResponse create(CreateRoomRequest request);
    List<RoomResponse> getAll();
    RoomResponse getById(Integer id);
    RoomResponse update(Integer id, UpdateRoomRequest request);
    void delete(Integer id);
    List<AvailableRoomResponse> findAvailable(String typeName, LocalDate checkIn, LocalDate checkOut);
}
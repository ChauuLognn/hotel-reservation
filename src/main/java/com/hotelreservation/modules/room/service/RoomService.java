package com.hotelreservation.modules.room.service;

import static com.hotelreservation.modules.room.dto.RoomRequests.*;
import static com.hotelreservation.modules.room.dto.RoomResponses.*;
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
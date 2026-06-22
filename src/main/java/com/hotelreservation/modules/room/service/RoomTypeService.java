package com.hotelreservation.modules.room.service;

import static com.hotelreservation.modules.room.dto.RoomRequests.*;
import static com.hotelreservation.modules.room.dto.RoomResponses.*;
import java.util.List;

public interface RoomTypeService {
    RoomTypeResponse create(CreateRoomTypeRequest rq);
    List<RoomTypeResponse> getAll();
    RoomTypeResponse getByName(String name);
    RoomTypeResponse update(String name, UpdateRoomTypeRequest rq);
    void delete(String name);
}
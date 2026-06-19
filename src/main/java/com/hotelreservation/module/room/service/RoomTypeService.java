package com.hotelreservation.module.room.service;

import com.hotelreservation.module.room.dto.request.CreateRoomTypeRequest;
import com.hotelreservation.module.room.dto.request.UpdateRoomTypeRequest;
import com.hotelreservation.module.room.dto.response.RoomTypeResponse;
import java.util.List;

public interface RoomTypeService {
    RoomTypeResponse create(CreateRoomTypeRequest rq);
    List<RoomTypeResponse> getAll();
    RoomTypeResponse getByName(String name);
    RoomTypeResponse update(String name, UpdateRoomTypeRequest rq);
    void delete(String name);
}
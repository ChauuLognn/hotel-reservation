package com.hotelreservation.module.room.mapper;

import com.hotelreservation.module.room.dto.response.RoomResponse;
import com.hotelreservation.module.room.dto.response.RoomTypeResponse;
import com.hotelreservation.module.room.entity.Room;
import com.hotelreservation.module.room.entity.RoomType;

public class RoomMapper {

    public static RoomResponse toResponse(Room room) {
        if (room == null) return null;
        RoomResponse res = new RoomResponse();
        res.setId(room.getId());
        if (room.getRoomType() != null) {
            res.setTypeName(room.getRoomType().getName());
        }
        if (room.getStatus() != null) {
            res.setStatus(room.getStatus().name());
        }
        return res;
    }

    public static RoomTypeResponse toTypeResponse(RoomType rt) {
        if (rt == null) return null;
        RoomTypeResponse res = new RoomTypeResponse();
        res.setName(rt.getName());
        res.setCapacity(rt.getCapacity());
        res.setBasePrice(rt.getBasePrice());
        res.setDescription(rt.getDescription());
        return res;
    }

    private RoomMapper() {}
}

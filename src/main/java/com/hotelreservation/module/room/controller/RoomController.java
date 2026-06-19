package com.hotelreservation.module.room.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import com.hotelreservation.module.room.dto.request.CreateRoomRequest;
import com.hotelreservation.module.room.dto.request.UpdateRoomRequest;
import com.hotelreservation.module.room.dto.response.RoomResponse;
import com.hotelreservation.module.room.dto.request.CreateRoomTypeRequest;
import com.hotelreservation.module.room.dto.request.UpdateRoomTypeRequest;
import com.hotelreservation.module.room.dto.response.RoomTypeResponse;
import com.hotelreservation.module.room.dto.response.AvailableRoomResponse;
import com.hotelreservation.module.room.service.RoomService;
import com.hotelreservation.module.room.service.RoomTypeService;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired private RoomService rDomain;
    @Autowired private RoomTypeService rTDomain;

    // tìm các phòng thỏa mãn yêu cầu của khách
    @GetMapping("/available")
    public List<AvailableRoomResponse> findAvailableRooms(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        if (checkIn == null || checkOut == null) {
            throw new IllegalArgumentException("checkIn và checkOut là bắt buộc để tìm phòng trống");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("checkOut phải sau checkIn");
        }
        return rDomain.findAvailable(name, checkIn, checkOut);
    }

    @PostMapping
    public RoomResponse createRoom(@RequestBody CreateRoomRequest rq) {
        return rDomain.create(rq);
    }

    @GetMapping
    public List<RoomResponse> getAllRoom() {
        return rDomain.getAll();
    }

    @GetMapping("/{id}")
    public RoomResponse getRoomById(@PathVariable Integer id) {
        return rDomain.getById(id);
    }

    @PutMapping("/{id}")
    public RoomResponse updateRoom(@PathVariable Integer id, @RequestBody UpdateRoomRequest rq) {
        return rDomain.update(id, rq);
    }

    @DeleteMapping("/{id}")
    public String deleteRoom(@PathVariable Integer id) {
        rDomain.delete(id);
        return "Deleted room successfully";
    }

    // ─── Room Type ────────────────────────────────────────────────────────────

    @PostMapping("/roomTypes")
    public RoomTypeResponse createRoomType(@RequestBody CreateRoomTypeRequest rq) {
        return rTDomain.create(rq);
    }

    @GetMapping("/roomTypes")
    public List<RoomTypeResponse> getAllRoomType() {
        return rTDomain.getAll();
    }

    @GetMapping("/roomTypes/{name}")
    public RoomTypeResponse getRoomTypeByName(@PathVariable String name) {
        return rTDomain.getByName(name);
    }

    @PutMapping("/roomTypes/{name}")
    public RoomTypeResponse updateRoomType(@PathVariable String name, @RequestBody UpdateRoomTypeRequest rq) {
        return rTDomain.update(name, rq);
    }

    @DeleteMapping("/roomTypes/{name}")
    public String deleteRoomType(@PathVariable String name) {
        rTDomain.delete(name);
        return "Deleted successfully";
    }
}
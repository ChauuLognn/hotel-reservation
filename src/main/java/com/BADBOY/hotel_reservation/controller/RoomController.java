package com.BADBOY.hotel_reservation.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import com.BADBOY.hotel_reservation.dto.Room.RoomCreateRequest;
import com.BADBOY.hotel_reservation.dto.Room.RoomDto;
import com.BADBOY.hotel_reservation.dto.Room.RoomTypeCreateRequest;
import com.BADBOY.hotel_reservation.dto.Room.RoomTypeDto;
import com.BADBOY.hotel_reservation.dto.reservation.AvailableRoom;
import com.BADBOY.hotel_reservation.service.RoomDomain;
import com.BADBOY.hotel_reservation.service.RoomTypeDomain;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired private RoomDomain rDomain;
    @Autowired private RoomTypeDomain rTDomain;

    // tìm các phòng thỏa mãn yêu cầu của khách
    @GetMapping("/available")
    public List<AvailableRoom> findAvailableRooms(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return rDomain.findAvaiableRooms(name, checkIn, checkOut);
    }

    @PostMapping
    public RoomDto createRoom(@RequestBody RoomCreateRequest rq) {
        return rDomain.create(rq);
    }

    @GetMapping
    public List<RoomDto> getAllRoom() {
        return rDomain.getAll();
    }

    @GetMapping("/{id}")
    public RoomDto getRoomById(@PathVariable Integer id) {
        return rDomain.getById(id);
    }

    @PutMapping("/{id}")
    public RoomDto updateRoom(@PathVariable Integer id, @RequestBody RoomCreateRequest rq) {
        return rDomain.update(id, rq);
    }

    @DeleteMapping("/{id}")
    public String deleteRoom(@PathVariable Integer id) {
        rDomain.delete(id);
        return "Deleted room successfully";
    }

    // ─── Room Type ────────────────────────────────────────────────────────────

    @PostMapping("/roomTypes")
    public RoomTypeDto createRoomType(@RequestBody RoomTypeCreateRequest rq) {
        return rTDomain.create(rq);
    }

    @GetMapping("/roomTypes")
    public List<RoomTypeDto> getAllRoomType() {
        return rTDomain.getAll();
    }

    @GetMapping("/roomTypes/{name}")
    public RoomTypeDto getRoomTypeByName(@PathVariable String name) {
        return rTDomain.getByName(name);
    }

    @PutMapping("/roomTypes/{name}")
    public RoomTypeDto updateRoomType(@PathVariable String name, @RequestBody RoomTypeCreateRequest rq) {
        return rTDomain.update(name, rq);
    }

    @DeleteMapping("/roomTypes/{name}")
    public String deleteRoomType(@PathVariable String name) {
        rTDomain.delete(name);
        return "Deleted successfully";
    }
}

package com.hotelreservation.modules.room.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import static com.hotelreservation.modules.room.dto.RoomRequests.*;
import static com.hotelreservation.modules.room.dto.RoomResponses.*;
import com.hotelreservation.modules.room.service.RoomService;
import com.hotelreservation.modules.room.service.RoomTypeService;

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
    @PreAuthorize("hasRole('MANAGER')")
    public RoomResponse createRoom(@RequestBody @Valid CreateRoomRequest rq) {
        return rDomain.create(rq);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<RoomResponse> getAllRoom() {
        return rDomain.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public RoomResponse getRoomById(@PathVariable Integer id) {
        return rDomain.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public RoomResponse updateRoom(@PathVariable Integer id, @RequestBody @Valid UpdateRoomRequest rq) {
        return rDomain.update(id, rq);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public String deleteRoom(@PathVariable Integer id) {
        rDomain.delete(id);
        return "Deleted room successfully";
    }

    // ─── Room Type ────────────────────────────────────────────────────────────

    @PostMapping("/roomTypes")
    @PreAuthorize("hasRole('MANAGER')")
    public RoomTypeResponse createRoomType(@RequestBody @Valid CreateRoomTypeRequest rq) {
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
    @PreAuthorize("hasRole('MANAGER')")
    public RoomTypeResponse updateRoomType(@PathVariable String name, @RequestBody @Valid UpdateRoomTypeRequest rq) {
        return rTDomain.update(name, rq);
    }

    @DeleteMapping("/roomTypes/{name}")
    @PreAuthorize("hasRole('MANAGER')")
    public String deleteRoomType(@PathVariable String name) {
        rTDomain.delete(name);
        return "Deleted successfully";
    }
}
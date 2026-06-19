package modules.room.controller;


import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import modules.room.dto.RoomPayload.RoomCreateRequest;
import modules.room.dto.RoomPayload.RoomDto;
import modules.room.dto.RoomPayload.RoomTypeCreateRequest;
import modules.room.dto.RoomPayload.RoomTypeDto;
import modules.reservation.dto.ReservationPayload.AvailableRoom;
import modules.room.service.RoomService;
import modules.room.service.RoomTypeService;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired private RoomService rDomain;
    @Autowired private RoomTypeService rTDomain;

    // tìm các phòng thỏa mãn yêu cầu của khách
    @GetMapping("/available")
    public List<AvailableRoom> findAvailableRooms(
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
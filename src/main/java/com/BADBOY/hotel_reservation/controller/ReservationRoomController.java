package com.BADBOY.hotel_reservation.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.BADBOY.hotel_reservation.dto.ReservationGuest.ReservationGuestDto;
import com.BADBOY.hotel_reservation.dto.ReservationRoom.ReservationRoomDto;
import com.BADBOY.hotel_reservation.dto.Service.ReservationServiceCreationRequest;
import com.BADBOY.hotel_reservation.dto.Service.ReservationServiceDto;
import com.BADBOY.hotel_reservation.service.ReservationGuestDomain;
import com.BADBOY.hotel_reservation.service.ReservationRoomDomain;
import com.BADBOY.hotel_reservation.service.ReservationServiceDomain;

import jakarta.validation.Valid;

@RestController
public class ReservationRoomController {

    @Autowired private ReservationRoomDomain resRoomDomain;
    @Autowired private ReservationServiceDomain rSDomain;
    @Autowired private ReservationGuestDomain resGuestDomain;

    // ─── ReservationRoom ──────────────────────────────────────────────────────

    @GetMapping("/api/reservation-rooms/{resRoomId}")
    public ReservationRoomDto getById(@PathVariable String resRoomId) {
        return resRoomDomain.getResRoomById(resRoomId);
    }

    @GetMapping("/api/reservation-rooms/{resRoomId}/guestStays")
    public List<ReservationGuestDto> getResGuestsByResRoom(@PathVariable String resRoomId) {
        return resRoomDomain.getResGuestByResRoom(resRoomId);
    }

    @DeleteMapping("/api/reservation-rooms/{resRoomId}")
    public String deleteResRoom(@PathVariable String resRoomId) {
        resRoomDomain.delete(resRoomId);
        return "ReservationRoom deleted successfully";
    }

    @GetMapping("/api/reservation-rooms/{resRoomId}/services")
    public List<ReservationServiceDto> getServicesOfResRoom(@PathVariable String resRoomId) {
        return rSDomain.getAllOfResRoom(resRoomId);
    }

    @PostMapping("/api/reservation-rooms/{resRoomId}/services")
    public String createResService(@PathVariable String resRoomId,
                                   @RequestBody @Valid ReservationServiceCreationRequest rq,
                                   @RequestHeader("X-User_id") Integer userId) {
        rSDomain.create(resRoomId, rq, userId);
        return "ok";
    }

    @DeleteMapping("/api/reservation-rooms/{resRoomId}/services/{serId}")
    public String deleteResService(@PathVariable String serId) {
        rSDomain.delete(serId);
        return "ReservationService deleted successfully";
    }

    // ─── ReservationGuest ─────────────────────────────────────────────────────

    @GetMapping("/api/reservation-guests/reservation-room/{resRoomId}")
    public List<ReservationGuestDto> getGuestsByResRoom(@PathVariable String resRoomId) {
        return resGuestDomain.getGuestsByResRoomId(resRoomId);
    }

    @PostMapping("/api/reservation-guests/register")
    public ReservationGuestDto registerGuest(@RequestParam String resRoomId,
                                             @RequestParam Integer guestId) {
        return resGuestDomain.createReservationGuest(resRoomId, guestId);
    }

    @PostMapping("/api/reservation-guests/resRoomId={resRoomId}-guestId={guestId}")
    public void createReservationGuestLegacy(@PathVariable String resRoomId,
                                             @PathVariable Integer guestId) {
        resGuestDomain.createReservationGuest(resRoomId, guestId);
    }

    @PostMapping("/api/reservation-guests/resRoomId={resRoomId}-guestId={guestId}/checkIn")
    public ReservationGuestDto checkIn(@PathVariable String resRoomId,
                                       @PathVariable Integer guestId,
                                       @RequestBody(required = false) LocalDateTime checkInAt) {
        return resGuestDomain.setCheckIn(resRoomId, guestId, checkInAt);
    }

    @PostMapping("/api/reservation-guests/resRoomId={resRoomId}-guestId={guestId}/checkOut")
    public ReservationGuestDto checkOut(@PathVariable String resRoomId,
                                        @PathVariable Integer guestId,
                                        @RequestBody(required = false) LocalDateTime checkOutAt) {
        return resGuestDomain.setCheckOut(resRoomId, guestId, checkOutAt);
    }
}

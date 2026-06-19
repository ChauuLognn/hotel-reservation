package com.hotelreservation.module.reservation.controller;
import java.time.LocalDateTime;
import com.hotelreservation.module.reservation.dto.response.ReservationGuestResponse;
import com.hotelreservation.module.hotelservice.dto.request.AddReservationServiceRequest;
import com.hotelreservation.module.hotelservice.dto.response.ReservationServiceResponse;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hotelreservation.module.reservation.dto.request.ChangeStatusRequest;
import com.hotelreservation.module.reservation.dto.response.ReservationRoomResponse;
import com.hotelreservation.module.reservation.dto.response.StatusHistoryResponse;
import com.hotelreservation.module.reservation.dto.request.CreateReservationRequest;
import com.hotelreservation.module.reservation.dto.response.InitialReservationResponse;
import com.hotelreservation.module.reservation.dto.response.ReservationResponse;
import com.hotelreservation.module.reservation.service.ReservationService;

import jakarta.validation.Valid;

@RestController
public class ReservationController {


    @Autowired private ReservationService resDomain;

    // ─── Reservation ──────────────────────────────────────────────────────────

    @GetMapping("/api/reservations")
    public ReservationResponse getByResId(@RequestParam String resId) {
        return resDomain.getByResId(resId);
    }

    @GetMapping("/api/reservations/all")
    public List<ReservationResponse> getAllReservations() {
        return resDomain.getAllReservations();
    }

    @PostMapping("/api/reservations")
    public InitialReservationResponse confirmHold(@RequestHeader("X-User-Id") Integer userId,
                                                  @RequestBody @Valid CreateReservationRequest req) {
        return resDomain.createReservationFromRequest(req, userId);
    }

    @GetMapping("/api/reservations/guests/{guestId}")
    public List<ReservationResponse> getAllResByGuestId(@PathVariable Integer guestId) {
        return resDomain.getAllResByGuestId(guestId);
    }

    @GetMapping("/api/reservations/guests/{guestId}/latestRes")
    public ReservationResponse getLastResByGuestId(@PathVariable Integer guestId) {
        return resDomain.getLastResByGuestId(guestId);
    }

    @GetMapping("/api/reservations/{resId}")
    public List<ReservationRoomResponse> getResRoomByResId(@PathVariable String resId) {
        return resDomain.getResRoomByResId(resId);
    }

    @GetMapping("/api/reservations/{resId}/detail")
    public ReservationResponse getReservationDetail(@PathVariable String resId) {
        return resDomain.getByResId(resId);
    }



    // ─── Reservation Status History ───────────────────────────────────────────

    @GetMapping("/api/reservationStatus/{resId}")
    public List<StatusHistoryResponse> getStatusHistoryByReservation(@PathVariable String resId) {
        return resDomain.getHistoryByReservation(resId);
    }

    @GetMapping("/api/reservationStatus/{resId}/resRooms/{resRoomId}")
    public List<StatusHistoryResponse> getStatusHistoryByResRoom(@PathVariable String resRoomId) {
        return resDomain.getHistoryByReservationRoom(resRoomId);
    }

    @PostMapping("/api/reservationStatus/{resId}/status")
    public ResponseEntity<Void> updateReservationStatus(@PathVariable String resId,
                                                        @RequestBody ChangeStatusRequest req,
                                                        @RequestHeader("X-User-Id") Integer userId) {
        resDomain.updateReservationStatus(resId, req, userId);
        return ResponseEntity.noContent().build();
    }

// ─── ReservationRoom ──────────────────────────────────────────────────────

    @GetMapping("/api/reservation-rooms/{resRoomId}")
    public ReservationRoomResponse getById(@PathVariable String resRoomId) {
        return resDomain.getResRoomById(resRoomId);
    }

    @GetMapping("/api/reservation-rooms/{resRoomId}/guestStays")
    public List<ReservationGuestResponse> getResGuestsByResRoom(@PathVariable String resRoomId) {
        return resDomain.getResGuestByResRoom(resRoomId);
    }

    @DeleteMapping("/api/reservation-rooms/{resRoomId}")
    public String deleteResRoom(@PathVariable String resRoomId) {
        resDomain.deleteResRoom(resRoomId);
        return "ReservationRoom deleted successfully";
    }

    @GetMapping("/api/reservation-rooms/{resRoomId}/services")
    public List<ReservationServiceResponse> getServicesOfResRoom(@PathVariable String resRoomId) {
        return resDomain.getAllServicesOfResRoom(resRoomId);
    }

    @PostMapping("/api/reservation-rooms/{resRoomId}/services")
    public String createResService(@PathVariable String resRoomId,
                                   @RequestBody @Valid AddReservationServiceRequest rq,
                                   @RequestHeader("X-User_id") Integer userId) {
        resDomain.createReservationService(resRoomId, rq, userId);
        return "ok";
    }

    @DeleteMapping("/api/reservation-rooms/{resRoomId}/services/{serId}")
    public String deleteResService(@PathVariable String serId) {
        resDomain.deleteReservationService(serId);
        return "ReservationService deleted successfully";
    }

    // ─── ReservationGuest ─────────────────────────────────────────────────────

    @GetMapping("/api/reservation-guests/reservation-room/{resRoomId}")
    public List<ReservationGuestResponse> getGuestsByResRoom(@PathVariable String resRoomId) {
        return resDomain.getGuestsByResRoomId(resRoomId);
    }

    @PostMapping("/api/reservation-guests/register")
    public ReservationGuestResponse registerGuest(@RequestParam String resRoomId,
                                             @RequestParam Integer guestId) {
        return resDomain.createReservationGuest(resRoomId, guestId);
    }

    @PostMapping("/api/reservation-guests/resRoomId={resRoomId}-guestId={guestId}")
    public void createReservationGuestLegacy(@PathVariable String resRoomId,
                                             @PathVariable Integer guestId) {
        resDomain.createReservationGuest(resRoomId, guestId);
    }

    @PostMapping("/api/reservation-guests/resRoomId={resRoomId}-guestId={guestId}/checkIn")
    public ReservationGuestResponse checkIn(@PathVariable String resRoomId,
                                       @PathVariable Integer guestId,
                                       @RequestBody(required = false) LocalDateTime checkInAt) {
        return resDomain.setCheckIn(resRoomId, guestId, checkInAt);
    }

    @PostMapping("/api/reservation-guests/resRoomId={resRoomId}-guestId={guestId}/checkOut")
    public ReservationGuestResponse checkOut(@PathVariable String resRoomId,
                                        @PathVariable Integer guestId,
                                        @RequestBody(required = false) LocalDateTime checkOutAt) {
        return resDomain.setCheckOut(resRoomId, guestId, checkOutAt);
    }

}

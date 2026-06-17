package modules.reservation.controller;
import modules.account.entity.User;
import modules.billing.entity.Bill;
import modules.reservation.entity.Reservation;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import modules.reservation.dto.ChangeStatusRequest;
import modules.reservation.dto.ReservationRoomDto;
import modules.reservation.dto.StatusHistoryDTO;
import modules.billing.dto.ResRoomBillSummary;
import modules.billing.dto.ReservationBillSummary;
import modules.reservation.dto.CreateHoldRequest;
import modules.reservation.dto.InitialReservationResponse;
import modules.reservation.dto.ReservationDto;
import modules.billing.service.BillDomain;
import modules.reservation.service.ReservationDomain;
import modules.reservation.service.ReservationStatusHistoryDomain;

import jakarta.validation.Valid;

@RestController
public class ReservationController {

    @Autowired private ReservationDomain resDomain;
    @Autowired private BillDomain billDomain;
    @Autowired private ReservationStatusHistoryDomain statusHistoryDomain;

    // ─── Reservation ──────────────────────────────────────────────────────────

    @GetMapping("/api/reservations")
    public ReservationDto getByResId(@RequestParam String resId) {
        return resDomain.getByResId(resId);
    }

    @GetMapping("/api/reservations/all")
    public List<ReservationDto> getAllReservations() {
        return resDomain.getAllReservations();
    }

    @PostMapping("/api/reservations")
    public InitialReservationResponse confirmHold(@RequestHeader("X-User-Id") Integer userId,
                                                  @RequestBody @Valid CreateHoldRequest req) {
        return resDomain.createReservationFromRequest(req, userId);
    }

    @GetMapping("/api/reservations/guests/{guestId}")
    public List<ReservationDto> getAllResByGuestId(@PathVariable Integer guestId) {
        return resDomain.getAllResByGuestId(guestId);
    }

    @GetMapping("/api/reservations/guests/{guestId}/latestRes")
    public ReservationDto getLastResByGuestId(@PathVariable Integer guestId) {
        return resDomain.getLastResByGuestId(guestId);
    }

    @GetMapping("/api/reservations/{resId}")
    public List<ReservationRoomDto> getResRoomByResId(@PathVariable String resId) {
        return resDomain.getResRoomByResId(resId);
    }

    @GetMapping("/api/reservations/{resId}/detail")
    public ReservationDto getReservationDetail(@PathVariable String resId) {
        return resDomain.getByResId(resId);
    }

    // ─── Bill ─────────────────────────────────────────────────────────────────

    @PostMapping("/api/reservations/{resId}/bills")
    public void confirmedPaidBillsForResId(@PathVariable String resId) {
        billDomain.ConfirmedPaidBillsForResId(resId);
    }

    @PostMapping("/api/reservations/{resId}/bills/reservation-rooms/{resRoomId}")
    public void confirmedPaidBillsForResRoomId(@PathVariable String resRoomId) {
        billDomain.ConfirmedPaidBillsForResRoomId(resRoomId);
    }

    @GetMapping("/api/reservations/{resId}/bills")
    public ReservationBillSummary getReservationBillSummary(@PathVariable String resId) {
        return billDomain.createReservationBillSummary(resId);
    }

    @GetMapping("/api/reservations/{resId}/bills/reservation-rooms/{resRoomId}")
    public ResRoomBillSummary getResRoomBillSummary(@PathVariable String resRoomId) {
        return billDomain.createResRoomBillSummary(resRoomId);
    }

    // ─── Reservation Status History ───────────────────────────────────────────

    @GetMapping("/api/reservationStatus/{resId}")
    public List<StatusHistoryDTO> getStatusHistoryByReservation(@PathVariable String resId) {
        return statusHistoryDomain.getHistoryByReservation(resId);
    }

    @GetMapping("/api/reservationStatus/{resId}/resRooms/{resRoomId}")
    public List<StatusHistoryDTO> getStatusHistoryByResRoom(@PathVariable String resRoomId) {
        return statusHistoryDomain.getHistoryByReservationRoom(resRoomId);
    }

    @PostMapping("/api/reservationStatus/{resId}/status")
    public ResponseEntity<Void> updateReservationStatus(@PathVariable String resId,
                                                        @RequestBody ChangeStatusRequest req,
                                                        @RequestHeader("X-User-Id") Integer userId) {
        statusHistoryDomain.updateReservationStatus(resId, req, userId);
        return ResponseEntity.noContent().build();
    }
}
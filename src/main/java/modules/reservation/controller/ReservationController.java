package modules.reservation.controller;
import modules.reservation.entity.ReservationGuest;
import modules.reservation.entity.ReservationRoom;
import java.time.LocalDateTime;
import modules.reservation.dto.ReservationGuestDto;
import modules.hotel_service.dto.ReservationServiceCreationRequest;
import modules.hotel_service.dto.ReservationServiceDto;
import modules.reservation.service.ReservationGuestService;
import modules.reservation.service.ReservationRoomService;
import modules.hotel_service.service.ReservationServiceService;
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
import modules.billing.service.BillService;
import modules.reservation.service.ReservationService;
import modules.reservation.service.ReservationStatusHistoryService;

import jakarta.validation.Valid;

@RestController
public class ReservationController {
    @Autowired private ReservationRoomService resRoomDomain;
    @Autowired private ReservationServiceService rSDomain;
    @Autowired private ReservationGuestService resGuestDomain;


    @Autowired private ReservationService resDomain;
    @Autowired private BillService billDomain;
    @Autowired private ReservationStatusHistoryService statusHistoryDomain;

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

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

import org.springframework.security.access.prepost.PreAuthorize;
import com.hotelreservation.module.account.repository.UserRepository;
import com.hotelreservation.module.reservation.repository.ReservationRepository;
import com.hotelreservation.module.reservation.dto.response.ReservationFullDetailResponse;

import jakarta.validation.Valid;

@RestController
public class ReservationController {


    @Autowired private ReservationService resDomain;
    @Autowired private UserRepository userRepository;
    @Autowired private ReservationRepository reservationRepository;

    private void checkReservationOwnership(String resId) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isCustomer = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            String account = auth.getName();
            com.hotelreservation.module.account.entity.User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
            com.hotelreservation.module.account.entity.Guest guest = user.getGuest();
            if (guest == null) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: No guest profile associated");
            }
            com.hotelreservation.module.reservation.entity.Reservation res = reservationRepository.findById(resId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
            if (res.getGuest() == null || !res.getGuest().getId().equals(guest.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this reservation");
            }
        }
    }

    // ─── Reservation ──────────────────────────────────────────────────────────

    @GetMapping("/api/reservations")
    public ReservationResponse getByResId(@RequestParam String resId) {
        checkReservationOwnership(resId);
        return resDomain.getByResId(resId);
    }

    @GetMapping("/api/reservations/all")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<ReservationResponse> getAllReservations() {
        return resDomain.getAllReservations();
    }

    @PostMapping("/api/reservations")
    public InitialReservationResponse confirmHold(@RequestHeader("X-User-Id") Integer userId,
                                                  @RequestBody @Valid CreateReservationRequest req) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isCustomer = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            String account = auth.getName();
            com.hotelreservation.module.account.entity.User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
            com.hotelreservation.module.account.entity.Guest guest = user.getGuest();
            if (guest == null || !guest.getId().equals(req.getGuestId())) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Cannot create reservation for another guest");
            }
        }
        return resDomain.createReservationFromRequest(req, userId);
    }

    @GetMapping("/api/reservations/guests/{guestId}")
    public List<ReservationResponse> getAllResByGuestId(@PathVariable Integer guestId) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isCustomer = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            String account = auth.getName();
            com.hotelreservation.module.account.entity.User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
            com.hotelreservation.module.account.entity.Guest guest = user.getGuest();
            if (guest == null || !guest.getId().equals(guestId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied");
            }
        }
        return resDomain.getAllResByGuestId(guestId);
    }

    @GetMapping("/api/reservations/guests/{guestId}/latestRes")
    public ReservationResponse getLastResByGuestId(@PathVariable Integer guestId) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isCustomer = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            String account = auth.getName();
            com.hotelreservation.module.account.entity.User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
            com.hotelreservation.module.account.entity.Guest guest = user.getGuest();
            if (guest == null || !guest.getId().equals(guestId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied");
            }
        }
        return resDomain.getLastResByGuestId(guestId);
    }

    @GetMapping("/api/reservations/{resId}")
    public List<ReservationRoomResponse> getResRoomByResId(@PathVariable String resId) {
        checkReservationOwnership(resId);
        return resDomain.getResRoomByResId(resId);
    }

    @GetMapping("/api/reservations/{resId}/detail")
    public ReservationResponse getReservationDetail(@PathVariable String resId) {
        checkReservationOwnership(resId);
        return resDomain.getByResId(resId);
    }

    @GetMapping("/api/reservations/{resId}/full-detail")
    public ReservationFullDetailResponse getReservationFullDetail(@PathVariable String resId) {
        checkReservationOwnership(resId);
        return resDomain.getReservationFullDetail(resId);
    }

    @GetMapping("/api/reservations/my-bookings")
    public List<ReservationResponse> getMyBookings() {
        return resDomain.getMyBookings();
    }



    // ─── Reservation Status History ───────────────────────────────────────────

    @GetMapping("/api/reservationStatus/{resId}")
    public List<StatusHistoryResponse> getStatusHistoryByReservation(@PathVariable String resId) {
        checkReservationOwnership(resId);
        return resDomain.getHistoryByReservation(resId);
    }

    @GetMapping("/api/reservationStatus/{resId}/resRooms/{resRoomId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<StatusHistoryResponse> getStatusHistoryByResRoom(@PathVariable String resRoomId) {
        return resDomain.getHistoryByReservationRoom(resRoomId);
    }

    @PostMapping("/api/reservationStatus/{resId}/status")
    public ResponseEntity<Void> updateReservationStatus(@PathVariable String resId,
                                                        @RequestBody ChangeStatusRequest req,
                                                        @RequestHeader("X-User-Id") Integer userId) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isCustomer = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            if (req.getNewStatus() != com.hotelreservation.common.enums.ReservationStatus.CANCELLED) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Customers can only cancel their reservations");
            }
            checkReservationOwnership(resId);
        }
        resDomain.updateReservationStatus(resId, req, userId);
        return ResponseEntity.noContent().build();
    }

// ─── ReservationRoom ──────────────────────────────────────────────────────

    @GetMapping("/api/reservation-rooms/{resRoomId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public ReservationRoomResponse getById(@PathVariable String resRoomId) {
        return resDomain.getResRoomById(resRoomId);
    }

    @GetMapping("/api/reservation-rooms/{resRoomId}/guestStays")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<ReservationGuestResponse> getResGuestsByResRoom(@PathVariable String resRoomId) {
        return resDomain.getResGuestByResRoom(resRoomId);
    }

    @DeleteMapping("/api/reservation-rooms/{resRoomId}")
    @PreAuthorize("hasRole('MANAGER')")
    public String deleteResRoom(@PathVariable String resRoomId) {
        resDomain.deleteResRoom(resRoomId);
        return "ReservationRoom deleted successfully";
    }

    @GetMapping("/api/reservation-rooms/{resRoomId}/services")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<ReservationServiceResponse> getServicesOfResRoom(@PathVariable String resRoomId) {
        return resDomain.getAllServicesOfResRoom(resRoomId);
    }

    @PostMapping("/api/reservation-rooms/{resRoomId}/services")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public String createResService(@PathVariable String resRoomId,
                                   @RequestBody @Valid AddReservationServiceRequest rq,
                                   @RequestHeader("X-User_id") Integer userId) {
        resDomain.createReservationService(resRoomId, rq, userId);
        return "ok";
    }

    @DeleteMapping("/api/reservation-rooms/{resRoomId}/services/{serId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public String deleteResService(@PathVariable String serId) {
        resDomain.deleteReservationService(serId);
        return "ReservationService deleted successfully";
    }

    // ─── ReservationGuest ─────────────────────────────────────────────────────

    @GetMapping("/api/reservation-guests/reservation-room/{resRoomId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<ReservationGuestResponse> getGuestsByResRoom(@PathVariable String resRoomId) {
        return resDomain.getGuestsByResRoomId(resRoomId);
    }

    @PostMapping("/api/reservation-guests/register")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public ReservationGuestResponse registerGuest(@RequestParam String resRoomId,
                                             @RequestParam Integer guestId) {
        return resDomain.createReservationGuest(resRoomId, guestId);
    }

    @PostMapping("/api/reservation-guests/rooms/{resRoomId}/guests/{guestId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public void createReservationGuestLegacy(@PathVariable String resRoomId,
                                             @PathVariable Integer guestId) {
        resDomain.createReservationGuest(resRoomId, guestId);
    }

    @PostMapping("/api/reservation-guests/rooms/{resRoomId}/guests/{guestId}/check-in")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public ReservationGuestResponse checkIn(@PathVariable String resRoomId,
                                       @PathVariable Integer guestId,
                                       @RequestBody(required = false) LocalDateTime checkInAt) {
        return resDomain.setCheckIn(resRoomId, guestId, checkInAt);
    }

    @PostMapping("/api/reservation-guests/rooms/{resRoomId}/guests/{guestId}/check-out")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public ReservationGuestResponse checkOut(@PathVariable String resRoomId,
                                        @PathVariable Integer guestId,
                                        @RequestBody(required = false) LocalDateTime checkOutAt) {
        return resDomain.setCheckOut(resRoomId, guestId, checkOutAt);
    }

}

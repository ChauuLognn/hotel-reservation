package com.hotelreservation.modules.reservation.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import static com.hotelreservation.modules.reservation.dto.ReservationRequests.*;
import static com.hotelreservation.modules.reservation.dto.ReservationResponses.*;
import com.hotelreservation.modules.reservation.service.ReservationService;
import com.hotelreservation.modules.account.repository.UserRepository;
import com.hotelreservation.modules.reservation.repository.ReservationRepository;

import jakarta.validation.Valid;
import com.hotelreservation.modules.hotelservice.dto.HotelserviceResponses.ReservationServiceResponse;
import com.hotelreservation.modules.hotelservice.dto.HotelserviceRequests.AddReservationServiceRequest;

@RestController
@SuppressWarnings("null")
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
            com.hotelreservation.modules.account.entity.User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
            com.hotelreservation.modules.account.entity.Guest guest = user.getGuest();
            if (guest == null) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: No guest profile associated");
            }
            com.hotelreservation.modules.reservation.entity.Reservation res = reservationRepository.findById(resId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
            if (res.getGuest() == null || !res.getGuest().getId().equals(guest.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: You do not own this reservation");
            }
        }
    }

    // ─── Reservation ──────────────────────────────────────────────────────────

    @GetMapping("/api/reservations")
    public ReservationResponse getByResId(@RequestParam("resId") String resId) {
        checkReservationOwnership(resId);
        return resDomain.getByResId(resId);
    }

    @GetMapping("/api/reservations/all")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<ReservationResponse> getAllReservations() {
        return resDomain.getAllReservations();
    }

    @PostMapping("/api/reservations")
    public InitialReservationResponse confirmHold(@RequestHeader(value = "X-User-Id", required = false) Integer userId,
                                                  @RequestBody @Valid CreateReservationRequest req) {
        if (userId == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                String account = auth.getName();
                com.hotelreservation.modules.account.entity.User user = userRepository.findByAccount(account).orElse(null);
                if (user != null) {
                    userId = user.getId();
                }
            }
        }
        if (userId == null) {
            throw new IllegalArgumentException("User identifier is required");
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isCustomer = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            String account = auth.getName();
            com.hotelreservation.modules.account.entity.User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
            com.hotelreservation.modules.account.entity.Guest guest = user.getGuest();
            if (guest == null || !guest.getId().equals(req.getGuestId())) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied: Cannot create reservation for another guest");
            }
        }
        return resDomain.createReservationFromRequest(req, userId);
    }

    @GetMapping("/api/reservations/guests/{guestId}")
    public List<ReservationResponse> getAllResByGuestId(@PathVariable("guestId") Integer guestId) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isCustomer = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            String account = auth.getName();
            com.hotelreservation.modules.account.entity.User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
            com.hotelreservation.modules.account.entity.Guest guest = user.getGuest();
            if (guest == null || !guest.getId().equals(guestId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied");
            }
        }
        return resDomain.getAllResByGuestId(guestId);
    }

    @GetMapping("/api/reservations/guests/{guestId}/latestRes")
    public ReservationResponse getLastResByGuestId(@PathVariable("guestId") Integer guestId) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isCustomer = auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
        if (isCustomer) {
            String account = auth.getName();
            com.hotelreservation.modules.account.entity.User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Access denied"));
            com.hotelreservation.modules.account.entity.Guest guest = user.getGuest();
            if (guest == null || !guest.getId().equals(guestId)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied");
            }
        }
        return resDomain.getLastResByGuestId(guestId);
    }

    @GetMapping("/api/reservations/{resId}")
    public List<ReservationRoomResponse> getResRoomByResId(@PathVariable("resId") String resId) {
        checkReservationOwnership(resId);
        return resDomain.getResRoomByResId(resId);
    }

    @GetMapping("/api/reservations/{resId}/detail")
    public ReservationResponse getReservationDetail(@PathVariable("resId") String resId) {
        checkReservationOwnership(resId);
        return resDomain.getByResId(resId);
    }

    @GetMapping("/api/reservations/{resId}/full-detail")
    public ReservationFullDetailResponse getReservationFullDetail(@PathVariable("resId") String resId) {
        checkReservationOwnership(resId);
        return resDomain.getReservationFullDetail(resId);
    }

    @GetMapping("/api/reservations/my-bookings")
    public List<ReservationResponse> getMyBookings() {
        return resDomain.getMyBookings();
    }

    // ─── Reservation Status History ───────────────────────────────────────────

    @GetMapping("/api/reservationStatus/{resId}")
    public List<StatusHistoryResponse> getStatusHistoryByReservation(@PathVariable("resId") String resId) {
        checkReservationOwnership(resId);
        return resDomain.getHistoryByReservation(resId);
    }

    @GetMapping("/api/reservationStatus/{resId}/resRooms/{resRoomId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<StatusHistoryResponse> getStatusHistoryByResRoom(
            @PathVariable("resId") String resId,
            @PathVariable("resRoomId") String resRoomId) {
        return resDomain.getHistoryByReservationRoom(resRoomId);
    }

    @PostMapping("/api/reservationStatus/{resId}/status")
    public ResponseEntity<Void> updateReservationStatus(@PathVariable("resId") String resId,
                                                        @RequestBody ChangeStatusRequest req,
                                                        @RequestHeader(value = "X-User-Id", required = false) Integer userId) {
        if (userId == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                String account = auth.getName();
                com.hotelreservation.modules.account.entity.User user = userRepository.findByAccount(account).orElse(null);
                if (user != null) {
                    userId = user.getId();
                }
            }
        }
        if (userId == null) {
            throw new IllegalArgumentException("User identifier is required");
        }

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
    public ReservationRoomResponse getById(@PathVariable("resRoomId") String resRoomId) {
        return resDomain.getResRoomById(resRoomId);
    }

    @GetMapping("/api/reservation-rooms/{resRoomId}/guestStays")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<ReservationGuestResponse> getResGuestsByResRoom(@PathVariable("resRoomId") String resRoomId) {
        return resDomain.getResGuestByResRoom(resRoomId);
    }

    @DeleteMapping("/api/reservation-rooms/{resRoomId}")
    @PreAuthorize("hasRole('MANAGER')")
    public String deleteResRoom(@PathVariable("resRoomId") String resRoomId) {
        resDomain.deleteResRoom(resRoomId);
        return "ReservationRoom deleted successfully";
    }

    @GetMapping("/api/reservation-rooms/{resRoomId}/services")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<ReservationServiceResponse> getServicesOfResRoom(@PathVariable("resRoomId") String resRoomId) {
        return resDomain.getAllServicesOfResRoom(resRoomId);
    }

    @PostMapping("/api/reservation-rooms/{resRoomId}/services")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public String createResService(@PathVariable("resRoomId") String resRoomId,
                                   @RequestBody @Valid AddReservationServiceRequest rq,
                                   @RequestHeader(value = "X-User_id", required = false) Integer userId) {
        if (userId == null) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                String account = auth.getName();
                com.hotelreservation.modules.account.entity.User user = userRepository.findByAccount(account).orElse(null);
                if (user != null) {
                    userId = user.getId();
                }
            }
        }
        if (userId == null) {
            throw new IllegalArgumentException("User identifier is required");
        }

        resDomain.createReservationService(resRoomId, rq, userId);
        return "ok";
    }

    @DeleteMapping("/api/reservation-rooms/{resRoomId}/services/{serId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public String deleteResService(
            @PathVariable("resRoomId") String resRoomId,
            @PathVariable("serId") String serId) {
        resDomain.deleteReservationService(serId);
        return "ReservationService deleted successfully";
    }

    // ─── ReservationGuest ─────────────────────────────────────────────────────

    @GetMapping("/api/reservation-guests/reservation-room/{resRoomId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<ReservationGuestResponse> getGuestsByResRoom(@PathVariable("resRoomId") String resRoomId) {
        return resDomain.getGuestsByResRoomId(resRoomId);
    }

    @PostMapping("/api/reservation-guests/register")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public ReservationGuestResponse registerGuest(@RequestParam("resRoomId") String resRoomId,
                                                   @RequestParam("guestId") Integer guestId) {
        return resDomain.createReservationGuest(resRoomId, guestId);
    }

    @PostMapping("/api/reservation-guests/rooms/{resRoomId}/guests/{guestId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public void createReservationGuestLegacy(@PathVariable("resRoomId") String resRoomId,
                                             @PathVariable("guestId") Integer guestId) {
        resDomain.createReservationGuest(resRoomId, guestId);
    }

    @PostMapping("/api/reservation-guests/rooms/{resRoomId}/guests/{guestId}/check-in")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public ReservationGuestResponse checkIn(@PathVariable("resRoomId") String resRoomId,
                                             @PathVariable("guestId") Integer guestId,
                                             @RequestBody(required = false) LocalDateTime checkInAt) {
        return resDomain.setCheckIn(resRoomId, guestId, checkInAt);
    }

    @PostMapping("/api/reservation-guests/rooms/{resRoomId}/guests/{guestId}/check-out")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public ReservationGuestResponse checkOut(@PathVariable("resRoomId") String resRoomId,
                                              @PathVariable("guestId") Integer guestId,
                                              @RequestBody(required = false) LocalDateTime checkOutAt) {
        return resDomain.setCheckOut(resRoomId, guestId, checkOutAt);
    }
}

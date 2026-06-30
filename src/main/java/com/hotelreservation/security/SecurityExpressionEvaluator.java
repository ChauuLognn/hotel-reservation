package com.hotelreservation.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.hotelreservation.account.entity.Guest;
import com.hotelreservation.account.entity.User;
import com.hotelreservation.account.repository.UserRepository;
import com.hotelreservation.reservation.entity.Reservation;
import com.hotelreservation.reservation.repository.ReservationRepository;
import com.hotelreservation.reservation.dto.ReservationRequests.CreateReservationRequest;

import java.util.Optional;

@Component("securityEval")
public class SecurityExpressionEvaluator {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    public boolean hasReservationAccess(String resId) {
        if (resId == null || resId.trim().isEmpty()) {
            return false;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        boolean isStaff = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_MANAGER") || a.equals("ROLE_EMPLOYEE"));

        if (isStaff) {
            return true;
        }

        // Customer role verification
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByAccount(username);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        Guest guest = user.getGuest();
        if (guest == null) {
            return false;
        }

        Optional<Reservation> resOpt = reservationRepository.findById(resId);
        if (resOpt.isEmpty()) {
            return false;
        }

        Reservation reservation = resOpt.get();
        return reservation.getGuest() != null && reservation.getGuest().getId().equals(guest.getId());
    }

    public boolean hasGuestAccess(Integer guestId) {
        if (guestId == null) {
            return false;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        boolean isStaff = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_MANAGER") || a.equals("ROLE_EMPLOYEE"));

        if (isStaff) {
            return true;
        }

        // Customer role check
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByAccount(username);
        if (userOpt.isEmpty()) {
            return false;
        }

        User user = userOpt.get();
        Guest guest = user.getGuest();
        if (guest == null) {
            return false;
        }

        return guest.getId().equals(guestId);
    }

    public boolean hasGuestAccessForRequest(CreateReservationRequest req) {
        if (req == null) {
            return false;
        }
        return hasGuestAccess(req.getGuestId());
    }
}

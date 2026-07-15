package com.hotelreservation.account.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import com.hotelreservation.account.dto.AccountRequests.GuestCreateRequest;
import com.hotelreservation.account.dto.AccountResponses.GuestResponse;
import com.hotelreservation.account.entity.Guest;
import com.hotelreservation.account.entity.User;
import com.hotelreservation.account.mapper.AccountMapper;
import com.hotelreservation.account.repository.GuestRepository;
import com.hotelreservation.account.repository.UserRepository;
import com.hotelreservation.account.service.GuestService;
import com.hotelreservation.reservation.service.ReservationService;
import static com.hotelreservation.reservation.dto.ReservationResponses.GuestStayResponse;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/guests")
@Transactional
public class GuestController {

    @Autowired 
    private GuestService gDomain;

    @Autowired 
    private ReservationService resDomain;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GuestRepository guestRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public GuestResponse createGuest(@RequestBody @Valid GuestCreateRequest rq) {
        return gDomain.create(rq);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public GuestResponse getMyGuestProfile() {
        User user = currentUser();
        if (user.getGuest() == null) {
            throw new IllegalArgumentException("Guest profile not found");
        }
        return AccountMapper.toResponse(user.getGuest());
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public GuestResponse upsertMyGuestProfile(@RequestBody @Valid GuestCreateRequest rq) {
        User user = currentUser();
        Guest guest = user.getGuest();
        if (guest == null) {
            guest = new Guest();
        }
        guest.setFirstName(rq.getFirstName());
        guest.setLastName(rq.getLastName());
        guest.setIdentityNum(rq.getIdentityNum());
        guest.setPhone(rq.getPhone());
        guest.setDateOfBirth(rq.getDateOfBirth());
        guest = guestRepository.save(guest);
        if (user.getGuest() == null) {
            user.setGuest(guest);
            userRepository.save(user);
        }
        return AccountMapper.toResponse(guest);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<GuestResponse> getAllGuests() {
        return gDomain.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public GuestResponse getGuestById(@PathVariable Integer id) {
        return gDomain.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public GuestResponse updateGuest(@PathVariable Integer id, @RequestBody @Valid GuestCreateRequest rq) {
        return gDomain.update(id, rq);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public String deleteGuest(@PathVariable Integer id) {
        gDomain.delete(id);
        return "Deleted guest successfully";
    }

    @GetMapping("/{guestId}/stays")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public GuestStayResponse getStaysOfGuest(@PathVariable Integer guestId) {
        return resDomain.getStaysOfGuest(guestId);
    }

    private User currentUser() {
        String account = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByAccount(account)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}

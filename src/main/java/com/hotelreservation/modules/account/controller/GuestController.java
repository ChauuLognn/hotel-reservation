package com.hotelreservation.modules.account.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.hotelreservation.modules.account.dto.AccountRequests.GuestCreateRequest;
import com.hotelreservation.modules.account.dto.AccountResponses.GuestResponse;
import com.hotelreservation.modules.account.service.GuestService;
import com.hotelreservation.modules.reservation.service.ReservationService;
import static com.hotelreservation.modules.reservation.dto.ReservationResponses.GuestStayResponse;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/guests")
public class GuestController {

    @Autowired 
    private GuestService gDomain;

    @Autowired 
    private ReservationService resDomain;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public GuestResponse createGuest(@RequestBody @Valid GuestCreateRequest rq) {
        return gDomain.create(rq);
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
}

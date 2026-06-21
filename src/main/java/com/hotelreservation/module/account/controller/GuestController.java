package com.hotelreservation.module.account.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.hotelreservation.module.account.dto.request.GuestCreateRequest;
import com.hotelreservation.module.account.dto.response.GuestResponse;
import com.hotelreservation.module.account.service.GuestService;
import com.hotelreservation.module.reservation.dto.response.GuestStayResponse;
import com.hotelreservation.module.reservation.service.ReservationService;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/guests")
@PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
public class GuestController {

    @Autowired
    private GuestService gDomain;

    @Autowired
    private ReservationService resDomain;

    @PostMapping
    public GuestResponse createGuest(@RequestBody @Valid GuestCreateRequest rq) {
        return gDomain.create(rq);
    }

    @GetMapping
    public List<GuestResponse> getAllGuests() {
        return gDomain.getAll();
    }

    @GetMapping("/{id}")
    public GuestResponse getGuestById(@PathVariable Integer id) {
        return gDomain.getById(id);
    }

    @PutMapping("/{id}")
    public GuestResponse updateGuest(@PathVariable Integer id, @RequestBody @Valid GuestCreateRequest rq) {
        return gDomain.update(id, rq);
    }

    @DeleteMapping("/{id}")
    public String deleteGuest(@PathVariable Integer id) {
        gDomain.delete(id);
        return "Deleted guest successfully";
    }

    @GetMapping("/{guestId}/stays")
    public GuestStayResponse getStaysOfGuest(@PathVariable Integer guestId) {
        return resDomain.getStaysOfGuest(guestId);
    }
}

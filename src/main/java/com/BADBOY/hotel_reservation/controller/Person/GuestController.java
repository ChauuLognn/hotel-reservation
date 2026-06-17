package com.BADBOY.hotel_reservation.controller.Person;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.BADBOY.hotel_reservation.dto.Person.GuestCreationRequest;
import com.BADBOY.hotel_reservation.dto.Person.GuestDto;
import com.BADBOY.hotel_reservation.dto.ReservationGuest.GuestStayDto;
import com.BADBOY.hotel_reservation.service.Person.GuestDomain;
import com.BADBOY.hotel_reservation.service.ReservationGuestDomain;

@RestController
@RequestMapping("/api/guests")
public class GuestController {
    @Autowired GuestDomain gDomain;
    @Autowired ReservationGuestDomain resGuestDomain;

    @PostMapping
    public GuestDto create(@RequestBody GuestCreationRequest rq){
        return gDomain.create(rq);
    }

    @GetMapping
    public List<GuestDto> getAll(){
        return gDomain.getAll();
    }

    @GetMapping("/{id}")
    public GuestDto getById(@PathVariable Integer id){
        return gDomain.getById(id);
    }

    @PutMapping("/{id}")
    public GuestDto update(@PathVariable Integer id, @RequestBody GuestCreationRequest rq){
        return gDomain.update(id, rq);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id){
        gDomain.delete(id);
        return "Deleted guest successfully";
    }

    // lấy ra mọi bản ghi lưu trú của một khách
    @GetMapping("/{guestId}/stays")
    public GuestStayDto getStaysOfGuest(@PathVariable Integer guestId){
        return resGuestDomain.getStaysOfGuest(guestId);
    }
}

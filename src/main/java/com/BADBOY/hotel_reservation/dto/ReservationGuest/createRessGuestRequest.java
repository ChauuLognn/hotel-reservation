package com.BADBOY.hotel_reservation.dto.ReservationGuest;
import java.util.List;

public class createRessGuestRequest {
    List<Integer> guests;

    public List<Integer> getGuests() {
        return guests;
    }

    public void setGuests(List<Integer> guests) {
        this.guests = guests;
    }
    
}
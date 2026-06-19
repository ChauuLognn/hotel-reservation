package com.hotelreservation.module.reservation.event;

import org.springframework.context.ApplicationEvent;

public class ReservationCreatedEvent extends ApplicationEvent {
    private final String reservationId;
    private final Integer guestId;

    public ReservationCreatedEvent(Object source, String reservationId, Integer guestId) {
        super(source);
        this.reservationId = reservationId;
        this.guestId = guestId;
    }

    public String getReservationId() { return reservationId; }
    public Integer getGuestId() { return guestId; }
}

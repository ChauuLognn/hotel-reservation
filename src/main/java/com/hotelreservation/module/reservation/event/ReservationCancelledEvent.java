package com.hotelreservation.module.reservation.event;

import org.springframework.context.ApplicationEvent;

public class ReservationCancelledEvent extends ApplicationEvent {
    private final String reservationId;
    private final Integer guestId;
    private final String reason;

    public ReservationCancelledEvent(Object source, String reservationId, Integer guestId, String reason) {
        super(source);
        this.reservationId = reservationId;
        this.guestId = guestId;
        this.reason = reason;
    }

    public String getReservationId() { return reservationId; }
    public Integer getGuestId() { return guestId; }
    public String getReason() { return reason; }
}

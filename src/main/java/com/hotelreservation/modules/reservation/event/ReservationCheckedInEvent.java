package com.hotelreservation.modules.reservation.event;

import org.springframework.context.ApplicationEvent;

public class ReservationCheckedInEvent extends ApplicationEvent {
    private final String reservationId;
    private final Integer guestId;
    private final String resRoomId;

    public ReservationCheckedInEvent(Object source, String reservationId, Integer guestId, String resRoomId) {
        super(source);
        this.reservationId = reservationId;
        this.guestId = guestId;
        this.resRoomId = resRoomId;
    }

    public String getReservationId() { return reservationId; }
    public Integer getGuestId() { return guestId; }
    public String getResRoomId() { return resRoomId; }
}

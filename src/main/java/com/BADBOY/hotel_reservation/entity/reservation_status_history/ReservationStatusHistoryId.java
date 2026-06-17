package com.BADBOY.hotel_reservation.entity.reservation_status_history;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ReservationStatusHistoryId implements Serializable {

    @Column(name = "reservationRoomId", nullable = false, length = 36)
    private String reservationRoomId;

    @Column(name = "historySeq", nullable = false)
    private Integer historySeq;

    public String getReservationRoomId(){return reservationRoomId;}
    public void setReservationRoomId(String reservationRoomId){this.reservationRoomId = reservationRoomId;}
    public Integer getHistorySeq(){return historySeq;}
    public void setHistorySeq(Integer historySeq){this.historySeq = historySeq;}
}

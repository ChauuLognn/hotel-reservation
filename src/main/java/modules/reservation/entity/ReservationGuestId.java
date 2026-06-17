package modules.reservation.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ReservationGuestId implements Serializable {

    @Column(name = "reservationRoomId", length = 36, nullable = false)
    private String reservationRoomId;

    @Column(name = "guestId", nullable = false)
    private Integer guestId;

    public String getReservationRoomId(){return reservationRoomId;}
    public void setReservationRoomId(String reservationRoomId){this.reservationRoomId = reservationRoomId;}
    public Integer getGuestId(){return guestId;}
    public void setGuestId(Integer guestId){this.guestId = guestId;}
}
package com.hotelreservation.modules.reservation.entity;

import java.time.LocalDateTime;

import com.hotelreservation.modules.account.entity.Guest;

import jakarta.persistence.*;

@Entity
@Table(name = "reservationGuest", indexes = {
    @Index(name = "idx_resguest_resroom", columnList = "reservationRoomId"),
    @Index(name = "idx_resguest_guest", columnList = "guestId")
})
public class ReservationGuest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "reservationRoomId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_resguest_resroom")
    )
    private ReservationRoom reservationRoom;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "guestId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_resguest_guest")
    )
    private Guest guest;

    @Column(name = "checkInAt")
    private LocalDateTime checkInAt;

    @Column(name = "checkOutAt")
    private LocalDateTime checkOutAt;

    public Long getId(){return id;}
    public void setId(Long id){this.id = id;}
    public ReservationRoom getReservationRoom(){return reservationRoom;}
    public void setReservationRoom(ReservationRoom reservationRoom){this.reservationRoom = reservationRoom;}
    public Guest getGuest(){return guest;}
    public void setGuest(Guest guest){this.guest = guest;}
    public LocalDateTime getCheckInAt(){return checkInAt;}
    public void setCheckInAt(LocalDateTime checkInAt){this.checkInAt = checkInAt;}
    public LocalDateTime getCheckOutAt(){return checkOutAt;}
    public void setCheckOutAt(LocalDateTime checkOutAt){this.checkOutAt = checkOutAt;}
}

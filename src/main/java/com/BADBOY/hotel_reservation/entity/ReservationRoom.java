package com.BADBOY.hotel_reservation.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "reservationRoom")
public class ReservationRoom {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id; // CHAR(36) - thường là UUID

    @ManyToOne
    @JoinColumn(
        name = "reservationId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_resroom_reservation")
    )
    private Reservation reservation;

    @ManyToOne
    @JoinColumn(
        name = "roomId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_resroom_room")
    )
    private Room room;

    @Column(name = "checkInTime", nullable = false)
    private LocalDate checkInTime;

    @Column(name = "checkOutTime", nullable = false)
    private LocalDate checkOutTime;

    @Column(name = "unitPrice", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "totalPrice", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    public String getId(){return id;}
    public void setId(String id){this.id = id;}
    public Reservation getReservation(){return reservation;}
    public void setReservation(Reservation reservation){this.reservation = reservation;}
    public Room getRoom(){return room;}
    public void setRoom(Room room){this.room = room;}
    public LocalDate getCheckInTime(){return checkInTime;}
    public void setCheckInTime(LocalDate checkInTime){this.checkInTime = checkInTime;}
    public LocalDate getCheckOutTime(){return checkOutTime;}
    public void setCheckOutTime(LocalDate checkOutTime){this.checkOutTime = checkOutTime;}
    public BigDecimal getUnitPrice(){return unitPrice;}
    public void setUnitPrice(BigDecimal unitPrice){this.unitPrice = unitPrice;}
    public BigDecimal getTotalPrice(){return totalPrice;}
    public void setTotalPrice(BigDecimal totalPrice){this.totalPrice = totalPrice;}
}

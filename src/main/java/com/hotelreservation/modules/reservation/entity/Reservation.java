package com.hotelreservation.modules.reservation.entity;
import com.hotelreservation.common.audit.BaseEntity;
import com.hotelreservation.modules.account.entity.Guest;
import com.hotelreservation.modules.account.entity.User;


import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.hotelreservation.common.enums.ReservationStatus;

import jakarta.persistence.*;

@Entity
@Table(name = "reservation", indexes = {
    @Index(name = "idx_reservation_guest", columnList = "guestId"),
    @Index(name = "idx_reservation_created_by", columnList = "createdBy"),
    @Index(name = "idx_reservation_status", columnList = "status"),
    @Index(name = "idx_reservation_booking_date", columnList = "bookingDate")
})
public class Reservation extends BaseEntity {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id; // CHAR(36) trong DB, thường dùng UUID

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "guestId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_reservation_guest")
    )
    private Guest guest;

    @Column(name = "totalAmount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "bookingDate", nullable = false)
    private LocalDateTime bookingDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "createdBy",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_reservation_user")
    )
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ReservationStatus status = ReservationStatus.PENDING_PAYMENT;

    public String getId(){return id;}
    public void setId(String id){this.id = id;}
    public Guest getGuest(){return guest;}
    public void setGuest(Guest guest){this.guest = guest;}
    public BigDecimal getTotalAmount(){return totalAmount;}
    public void setTotalAmount(BigDecimal totalAmount){this.totalAmount = totalAmount;}
    public LocalDateTime getBookingDate(){return bookingDate;}
    public void setBookingDate(LocalDateTime bookingDate){this.bookingDate = bookingDate;}
    public User getCreatedBy(){return createdBy;}
    public void setCreatedBy(User createdBy){this.createdBy = createdBy;}
    public ReservationStatus getStatus(){return status;}
    public void setStatus(ReservationStatus status){this.status = status;}
}

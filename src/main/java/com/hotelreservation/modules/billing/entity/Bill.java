package com.hotelreservation.modules.billing.entity;
import com.hotelreservation.common.audit.BaseEntity;
import com.hotelreservation.modules.reservation.entity.ReservationRoom;


import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.hotelreservation.common.enums.BillReason;
import com.hotelreservation.common.enums.PaymentStatus;

import jakarta.persistence.*;

@Entity
@Table(name = "bill", indexes = {
    @Index(name = "idx_bill_resroom", columnList = "reservationRoomId"),
    @Index(name = "idx_bill_status", columnList = "status"),
    @Index(name = "idx_bill_created_at", columnList = "createdAt")
})
public class Bill extends BaseEntity {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id; // CHAR(36) - tự generate UUID ở service

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "reservationRoomId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_bill_resroom")
    )
    private ReservationRoom reservationRoom;

    @Column(name = "totalAmount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason", nullable = false, length = 20)
    private BillReason reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PaymentStatus status;

    public String getId(){return id;}
    public void setId(String id){this.id = id;}
    public ReservationRoom getReservationRoom(){return reservationRoom;}
    public void setReservationRoom(ReservationRoom reservationRoom){this.reservationRoom = reservationRoom;}
    public BigDecimal getTotalAmount(){return totalAmount;}
    public void setTotalAmount(BigDecimal totalAmount){this.totalAmount = totalAmount;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setCreatedAt(LocalDateTime createdAt){this.createdAt = createdAt;}
    public BillReason getReason(){return reason;}
    public void setReason(BillReason reason){this.reason = reason;}
    public PaymentStatus getStatus(){return status;}
    public void setStatus(PaymentStatus status){this.status = status;}
}

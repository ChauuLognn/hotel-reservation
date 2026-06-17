package modules.billing.entity;
import modules.reservation.entity.ReservationRoom;


import java.math.BigDecimal;
import java.time.LocalDateTime;

import common.enums.BillReason;
import common.enums.PaymentStatus;

import jakarta.persistence.*;

@Entity
@Table(name = "bill")
public class Bill {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id; // CHAR(36) - tự generate UUID ở service

    @ManyToOne
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
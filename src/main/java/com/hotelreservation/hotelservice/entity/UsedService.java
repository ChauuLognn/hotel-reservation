package com.hotelreservation.hotelservice.entity;

import com.hotelreservation.account.entity.User;
import com.hotelreservation.reservation.entity.ReservationRoom;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;

@Entity
@Table(name = "reservationService", indexes = {
    @Index(name = "idx_resservice_resroom", columnList = "reservationRoomId"),
    @Index(name = "idx_resservice_service", columnList = "serviceId"),
    @Index(name = "idx_resservice_used_at", columnList = "usedAt")
})
public class UsedService {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "reservationRoomId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_resservice_resroom")
    )
    private ReservationRoom reservationRoom;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "serviceId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_resservice_service")
    )
    private HotelService service;

    @Column(name = "quantity", nullable = false)
    private Byte quantity = 1;

    @Column(name = "totalAmount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "usedAt", nullable = false)
    private LocalDateTime usedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "createdBy",
                nullable = false,
                foreignKey = @ForeignKey(name = "FK_reservationService_user"))
    private User createdBy;

    public String getId(){return id;}
    public void setId(String id){this.id = id;}
    public ReservationRoom getReservationRoom(){return reservationRoom;}
    public void setReservationRoom(ReservationRoom reservationRoom){this.reservationRoom = reservationRoom;}
    public HotelService getService(){return service;}
    public void setService(HotelService service){this.service = service;}
    public Byte getQuantity(){return quantity;}
    public void setQuantity(Byte quantity){this.quantity = quantity;}
    public BigDecimal getTotalAmount(){return totalAmount;}
    public void setTotalAmount(BigDecimal totalAmount){this.totalAmount = totalAmount;}
    public LocalDateTime getUsedAt(){return usedAt;}
    public void setUsedAt(LocalDateTime usedAt){this.usedAt = usedAt;}
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
}

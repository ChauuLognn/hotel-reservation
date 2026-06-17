package com.BADBOY.hotel_reservation.entity.reservation_status_history;

import java.time.LocalDateTime;

import com.BADBOY.hotel_reservation.entity.Enum.ReservationStatus;
import com.BADBOY.hotel_reservation.entity.ReservationRoom;
import com.BADBOY.hotel_reservation.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

@Entity
@Table(name = "reservationStatusHistory")
public class ReservationStatusHistory {

    @EmbeddedId
    private ReservationStatusHistoryId id;

    @MapsId("reservationRoomId")
    @ManyToOne
    @JoinColumn(
        name = "reservationRoomId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_reshistory_resroom")
    )
    private ReservationRoom reservationRoom;

    @Enumerated(EnumType.STRING)
    @Column(name = "oldStatus", nullable = false, length = 50)
    private ReservationStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "newStatus", nullable = false, length = 50)
    private ReservationStatus newStatus;

    @Column(name = "updatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(
        name = "updatedBy",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_reshistory_user")
    )
    private User updatedBy;

    @Column(name = "reason", length = 255)
    private String reason;

    public ReservationStatusHistoryId getId(){return id;}
    public void setId(ReservationStatusHistoryId id){this.id = id;}
    public ReservationRoom getReservationRoom(){return reservationRoom;}
    public void setReservationRoom(ReservationRoom reservationRoom){this.reservationRoom = reservationRoom;}
    public ReservationStatus getOldStatus(){return oldStatus;}
    public void setOldStatus(ReservationStatus oldStatus){this.oldStatus = oldStatus;}
    public ReservationStatus getNewStatus(){return newStatus;}
    public void setNewStatus(ReservationStatus newStatus){this.newStatus = newStatus;}
    public LocalDateTime getUpdatedAt(){return updatedAt;}
    public void setUpdatedAt(LocalDateTime updatedAt){this.updatedAt = updatedAt;}
    public User getUpdatedBy(){return updatedBy;}
    public void setUpdatedBy(User updatedBy){this.updatedBy = updatedBy;}
    public String getReason(){return reason;}
    public void setReason(String reason){this.reason = reason;}
}

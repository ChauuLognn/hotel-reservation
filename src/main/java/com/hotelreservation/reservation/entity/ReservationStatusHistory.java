package com.hotelreservation.reservation.entity;

import java.time.LocalDateTime;

import com.hotelreservation.common.enums.ReservationStatus;
import com.hotelreservation.account.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;

@Entity
@Table(name = "reservationStatusHistory", indexes = {
    @Index(name = "idx_reshistory_resroom", columnList = "reservationRoomId"),
    @Index(name = "idx_reshistory_updated_by", columnList = "updatedBy"),
    @Index(name = "idx_reshistory_updated_at", columnList = "updatedAt")
})
public class ReservationStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "reservationRoomId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_reshistory_resroom")
    )
    private ReservationRoom reservationRoom;

    @Column(name = "historySeq", nullable = false)
    private Integer historySeq;

    @Enumerated(EnumType.STRING)
    @Column(name = "oldStatus", nullable = false, length = 50)
    private ReservationStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "newStatus", nullable = false, length = 50)
    private ReservationStatus newStatus;

    @Column(name = "updatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "updatedBy",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_reshistory_user")
    )
    private User updatedBy;

    @Column(name = "reason", length = 255)
    private String reason;

    public Long getId(){return id;}
    public void setId(Long id){this.id = id;}
    public ReservationRoom getReservationRoom(){return reservationRoom;}
    public void setReservationRoom(ReservationRoom reservationRoom){this.reservationRoom = reservationRoom;}
    public Integer getHistorySeq(){return historySeq;}
    public void setHistorySeq(Integer historySeq){this.historySeq = historySeq;}
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

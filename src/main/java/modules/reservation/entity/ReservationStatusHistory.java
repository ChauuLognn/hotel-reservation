package modules.reservation.entity;

import java.time.LocalDateTime;

import common.enums.ReservationStatus;
import modules.account.entity.User;

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

@Entity
@Table(name = "reservationStatusHistory")
public class ReservationStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
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

    @ManyToOne
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

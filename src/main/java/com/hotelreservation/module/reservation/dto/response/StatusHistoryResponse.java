package com.hotelreservation.module.reservation.dto.response;

import com.hotelreservation.common.enums.ReservationStatus;
import java.time.LocalDateTime;

public class StatusHistoryResponse {
    private Integer roomId;
    private ReservationStatus oldStatus;
    private ReservationStatus newStatus;
    private LocalDateTime updatedAt;
    private String reason;

    public Integer getRoomId() { return roomId; }
    public void setRoomId(Integer roomId) { this.roomId = roomId; }
    public ReservationStatus getOldStatus() { return oldStatus; }
    public void setOldStatus(ReservationStatus oldStatus) { this.oldStatus = oldStatus; }
    public ReservationStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ReservationStatus newStatus) { this.newStatus = newStatus; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

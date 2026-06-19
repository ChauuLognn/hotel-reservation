package com.hotelreservation.module.reservation.dto.request;

import com.hotelreservation.common.enums.ReservationStatus;

public class ChangeStatusRequest {
    private ReservationStatus newStatus;
    private String reason;

    public ChangeStatusRequest() {}

    public ChangeStatusRequest(ReservationStatus newStatus, String reason) {
        this.newStatus = newStatus;
        this.reason = reason;
    }

    public ReservationStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ReservationStatus newStatus) { this.newStatus = newStatus; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

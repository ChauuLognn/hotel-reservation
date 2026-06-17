package modules.reservation.dto;

import common.enums.ReservationStatus;

// không cần để ý

// thông tin thay đổi trạng thái
public class ChangeStatusRequest {
    private ReservationStatus newStatus;
    private String reason;

    public ChangeStatusRequest(ReservationStatus newStatus, String reason) {
        this.newStatus = newStatus;
        this.reason = reason;
    }


    public ReservationStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ReservationStatus newStatus) { this.newStatus = newStatus; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
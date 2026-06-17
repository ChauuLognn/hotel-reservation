package modules.reservation.dto;

import java.time.LocalDateTime;

import common.enums.ReservationStatus;
import modules.reservation.entity.ReservationStatusHistory;

// thông tin lần thay đổi trạng thái của resRoom được trả về để xem
public class StatusHistoryDTO {

    private Integer roomId;
    private ReservationStatus oldStatus;
    private ReservationStatus newStatus;
    private LocalDateTime updatedAt;
    private String reason;

    public static StatusHistoryDTO fromEntity(ReservationStatusHistory e){
        StatusHistoryDTO dto = new StatusHistoryDTO();
        dto.roomId = e.getReservationRoom().getRoom().getId();
        dto.oldStatus = e.getOldStatus();
        dto.newStatus = e.getNewStatus();
        dto.updatedAt = e.getUpdatedAt();
        dto.reason = e.getReason();
        return dto;
    }

    public Integer getRoomId(){return roomId;}
    public ReservationStatus getOldStatus(){return oldStatus;}
    public ReservationStatus getNewStatus(){return newStatus;}
    public LocalDateTime getUpdatedAt(){return updatedAt;}
    public String getReason(){return reason;}
}
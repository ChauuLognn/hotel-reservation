package com.BADBOY.hotel_reservation.dto.billDto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.BADBOY.hotel_reservation.entity.Bill;

// bản ghi của một bill trả về cho người dùng xem
public class BillDTO {

    private Integer roomId;
    private BigDecimal totalAmount;
    private LocalDateTime date;
    private String reason; // ROOM_CHARGE | SERVICE | REFUND
    private String status; // PAID | UNPAID

    public static BillDTO fromEntity(Bill bill){
        BillDTO dto = new BillDTO();
        dto.roomId = bill.getReservationRoom().getRoom().getId();
        dto.totalAmount = bill.getTotalAmount();
        dto.date = bill.getCreatedAt();
        dto.reason = bill.getReason().name();
        dto.status = bill.getStatus().name();
        return dto;
    }

    public Integer getRoomId(){return roomId;}
    public void setResRoomId(Integer roomId){this.roomId = roomId;}
    public BigDecimal getTotalAmount(){return totalAmount;}
    public void setTotalAmount(BigDecimal totalAmount){this.totalAmount = totalAmount;}
    public LocalDateTime getDate(){return date;}
    public void setDate(LocalDateTime date){this.date = date;}
    public String getReason(){return reason;}
    public void setReason(String reason){this.reason = reason;}
    public String getStatus(){return status;}
    public void setStatus(String status){this.status = status;}
}
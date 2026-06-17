package com.BADBOY.hotel_reservation.dto.ReservationRoom;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.BADBOY.hotel_reservation.entity.ReservationRoom;

// không cần để ý

// thông tin một resRoom được trả về để xem
public class ReservationRoomDto {
    
    private String id; // resRoomId
    private Integer roomId;
    private LocalDate checkInTime;
    private LocalDate checkOutTime;
    private BigDecimal totalPrice;

    public static ReservationRoomDto fromEntity(ReservationRoom rr){
        ReservationRoomDto dto = new ReservationRoomDto();
        dto.id = rr.getId();
        dto.roomId = rr.getRoom().getId();
        dto.setCheckInTime(rr.getCheckInTime());
        dto.setCheckOutTime(rr.getCheckOutTime());
        dto.setTotalPrice(rr.getTotalPrice());
        return dto;
    }
    
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
    }

    public LocalDate getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDate checkInTime) {
        this.checkInTime = checkInTime;
    }

    public LocalDate getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(LocalDate checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }


}

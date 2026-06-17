package com.BADBOY.hotel_reservation.dto.ReservationGuest;

import java.time.LocalDateTime;

import com.BADBOY.hotel_reservation.entity.reservation_guest.ReservationGuest;

// không cần để ý

// thông tin một lần lưu trú của khách có thể xem
public class ReservationGuestDto {
    private Integer guestId;
    private String IdentityNum;
    private String guestName;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;

    public static ReservationGuestDto fromEntity(ReservationGuest rg){
        ReservationGuestDto dto = new ReservationGuestDto();
        dto.guestId = rg.getGuest().getId();
        dto.IdentityNum = rg.getGuest().getIdentityNum();
        dto.guestName = rg.getGuest().getFirstName() + " " + rg.getGuest().getLastName();
        dto.checkInAt = rg.getCheckInAt();
        dto.checkOutAt = rg.getCheckOutAt();
        return dto;
    }

    public Integer getGuestId() {return guestId;}
    public void setGuestId(Integer guestId) {this.guestId = guestId;}
    public String getGuestName() {return guestName;}
    public void setGuestName(String guestName) {this.guestName = guestName;}
    public LocalDateTime getCheckInAt() {return checkInAt;}
    public void setCheckInAt(LocalDateTime checkInAt) {this.checkInAt = checkInAt;}
    public LocalDateTime getCheckOutAt() {return checkOutAt;}
    public void setCheckOutAt(LocalDateTime checkOutAt) {this.checkOutAt = checkOutAt;}
    public String getIdentityNum() {return IdentityNum;}
    public void setIdentityNum(String IdentityNum) {this.IdentityNum = IdentityNum;}
}

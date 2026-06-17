package com.BADBOY.hotel_reservation.dto.ReservationGuest;

import java.time.LocalDateTime;
import java.util.List;

// không cần để ý

// thông tin mọi lần lưu trú của khách
public class GuestStayDto {
    private String guestName;
    private String IdentityNum;
    private List<Item> items;

    public static class Item{
        Integer roomId;
        LocalDateTime checkInAt;
        LocalDateTime checkOutAt;
        public Integer getRoomId() {return roomId;}
        public void setRoomId(Integer roomId) {this.roomId = roomId;}
        public LocalDateTime getCheckInAt() {return checkInAt;}
        public void setCheckInAt(LocalDateTime checkInAt) {this.checkInAt = checkInAt;}
        public LocalDateTime getCheckOutAt() {return checkOutAt;}
        public void setCheckOutAt(LocalDateTime checkOutAt) {this.checkOutAt = checkOutAt;}
    }

    public String getIdentityNum() {return IdentityNum;}
    public void setIdentityNum(String IdentityNum) {this.IdentityNum = IdentityNum;}
    public String getGuestName() {return guestName;}
    public void setGuestName(String guestName) {this.guestName = guestName;}
    public List<Item> getItems() {return items;}
    public void setItems(List<Item> items) {this.items = items;}

}

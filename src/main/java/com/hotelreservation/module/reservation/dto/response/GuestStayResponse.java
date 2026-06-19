package com.hotelreservation.module.reservation.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class GuestStayResponse {
    private String guestName;
    private String identityNum;
    private List<Item> items;

    public static class Item {
        private Integer roomId;
        private LocalDateTime checkInAt;
        private LocalDateTime checkOutAt;

        public Integer getRoomId() { return roomId; }
        public void setRoomId(Integer roomId) { this.roomId = roomId; }
        public LocalDateTime getCheckInAt() { return checkInAt; }
        public void setCheckInAt(LocalDateTime checkInAt) { this.checkInAt = checkInAt; }
        public LocalDateTime getCheckOutAt() { return checkOutAt; }
        public void setCheckOutAt(LocalDateTime checkOutAt) { this.checkOutAt = checkOutAt; }
    }

    public String getIdentityNum() { return identityNum; }
    public void setIdentityNum(String identityNum) { this.identityNum = identityNum; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public List<Item> getItems() { return items; }
    public void setItems(List<Item> items) { this.items = items; }
}

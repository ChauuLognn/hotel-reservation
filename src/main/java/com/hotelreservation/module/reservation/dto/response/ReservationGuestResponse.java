package com.hotelreservation.module.reservation.dto.response;

import java.time.LocalDateTime;

public class ReservationGuestResponse {
    private Integer guestId;
    private String identityNum;
    private String guestName;
    private LocalDateTime checkInAt;
    private LocalDateTime checkOutAt;

    public Integer getGuestId() { return guestId; }
    public void setGuestId(Integer guestId) { this.guestId = guestId; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public LocalDateTime getCheckInAt() { return checkInAt; }
    public void setCheckInAt(LocalDateTime checkInAt) { this.checkInAt = checkInAt; }
    public LocalDateTime getCheckOutAt() { return checkOutAt; }
    public void setCheckOutAt(LocalDateTime checkOutAt) { this.checkOutAt = checkOutAt; }
    public String getIdentityNum() { return identityNum; }
    public void setIdentityNum(String identityNum) { this.identityNum = identityNum; }
}

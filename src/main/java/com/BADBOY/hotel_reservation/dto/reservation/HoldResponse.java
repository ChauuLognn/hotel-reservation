package com.BADBOY.hotel_reservation.dto.reservation;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// không cần để ý

// thông tin bản nháp đặt phòng trả về cho người dùng xem
public class HoldResponse {
    private List<Integer> roomIds;
    private List<BigDecimal> finalPrices;
    private List<Long> nights;
    private LocalDateTime expiresAt;

    public HoldResponse(List<Integer> roomIds, 
                        List<BigDecimal> finalPrices, List<Long> nights, LocalDateTime expiresAt) {
        this.roomIds = roomIds;
        this.finalPrices = finalPrices;
        this.nights = nights;
        this.expiresAt = expiresAt;
    }

    public List<Integer> getRoomIds() { return roomIds; }
    public void setRoomIds(List<Integer> roomIds) { this.roomIds = roomIds; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public List<BigDecimal> getFinalPrices() { return finalPrices; }
    public void setFinalPrices(List<BigDecimal> finalPrices) { this.finalPrices = finalPrices; }
    public List<Long> getNights() { return this.nights;}
    public void setNights(List<Long> nights) { this.nights = nights;}

}

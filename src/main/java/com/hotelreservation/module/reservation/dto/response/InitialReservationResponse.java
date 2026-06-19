package com.hotelreservation.module.reservation.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class InitialReservationResponse {
    private String reservationId;
    private String guestName;
    private BigDecimal total;
    private InitialReservationResponse.HoldResponse hold;

    public InitialReservationResponse(String guestName, InitialReservationResponse.HoldResponse hold, String reservationId, BigDecimal total) {
        this.guestName = guestName;
        this.hold = hold;
        this.reservationId = reservationId;
        this.total = total;
    }

    public static class HoldResponse {
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

    @JsonProperty("resId")
    public String getReservationId() { return reservationId; }
    public void setReservationId(String reservationId) { this.reservationId = reservationId; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public InitialReservationResponse.HoldResponse getHold() { return hold; }
    public void setHold(InitialReservationResponse.HoldResponse hold) { this.hold = hold; }
}

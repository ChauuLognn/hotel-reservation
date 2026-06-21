package com.hotelreservation.module.reservation.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ReservationResponse {
    private String id;
    private String guestName;
    private String guestPhone;
    private BigDecimal total;
    private String status;
    private LocalDateTime bookingDate;
    private List<Integer> roomIds;
    private List<String> roomNames;
    private List<BigDecimal> prices;
    private List<Long> nights;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private String overallRoomStatus;

    @JsonProperty("resId")
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
    public List<Integer> getRoomIds() { return roomIds; }
    public void setRoomIds(List<Integer> roomIds) { this.roomIds = roomIds; }
    public List<String> getRoomNames() { return roomNames; }
    public void setRoomNames(List<String> roomNames) { this.roomNames = roomNames; }
    public List<BigDecimal> getPrices() { return prices; }
    public void setPrices(List<BigDecimal> prices) { this.prices = prices; }
    public List<Long> getNights() { return nights; }
    public void setNights(List<Long> nights) { this.nights = nights; }
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    public String getOverallRoomStatus() { return overallRoomStatus; }
    public void setOverallRoomStatus(String overallRoomStatus) { this.overallRoomStatus = overallRoomStatus; }
}

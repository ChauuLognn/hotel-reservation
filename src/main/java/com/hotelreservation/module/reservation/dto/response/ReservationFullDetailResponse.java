package com.hotelreservation.module.reservation.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.hotelreservation.module.hotelservice.dto.response.ReservationServiceResponse;

public class ReservationFullDetailResponse {
    private String id;
    private String guestName;
    private String guestPhone;
    private BigDecimal total;
    private String status;
    private LocalDateTime bookingDate;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private List<RoomDetailItem> rooms;
    private String overallRoomStatus;

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
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    public List<RoomDetailItem> getRooms() { return rooms; }
    public void setRooms(List<RoomDetailItem> rooms) { this.rooms = rooms; }
    public String getOverallRoomStatus() { return overallRoomStatus; }
    public void setOverallRoomStatus(String overallRoomStatus) { this.overallRoomStatus = overallRoomStatus; }

    public static class RoomDetailItem {
        private String id; // resRoomId
        private Integer roomId;
        private String roomTypeName;
        private LocalDate checkInTime;
        private LocalDate checkOutTime;
        private BigDecimal totalPrice;
        private List<ReservationGuestResponse> guests;
        private List<ReservationServiceResponse> services;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public Integer getRoomId() { return roomId; }
        public void setRoomId(Integer roomId) { this.roomId = roomId; }
        public String getRoomTypeName() { return roomTypeName; }
        public void setRoomTypeName(String roomTypeName) { this.roomTypeName = roomTypeName; }
        public LocalDate getCheckInTime() { return checkInTime; }
        public void setCheckInTime(LocalDate checkInTime) { this.checkInTime = checkInTime; }
        public LocalDate getCheckOutTime() { return checkOutTime; }
        public void setCheckOutTime(LocalDate checkOutTime) { this.checkOutTime = checkOutTime; }
        public BigDecimal getTotalPrice() { return totalPrice; }
        public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
        public List<ReservationGuestResponse> getGuests() { return guests; }
        public void setGuests(List<ReservationGuestResponse> guests) { this.guests = guests; }
        public List<ReservationServiceResponse> getServices() { return services; }
        public void setServices(List<ReservationServiceResponse> services) { this.services = services; }
    }
}

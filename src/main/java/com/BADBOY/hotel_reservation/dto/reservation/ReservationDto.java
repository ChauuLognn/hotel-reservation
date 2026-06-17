package com.BADBOY.hotel_reservation.dto.reservation;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import com.BADBOY.hotel_reservation.entity.Reservation;
import com.BADBOY.hotel_reservation.entity.ReservationRoom;

// thông tin tổng quát của reservation trả về cho người dùng xem
public class ReservationDto {
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

    public static ReservationDto fromEntity(Reservation r, List<ReservationRoom> rooms){

        List<Integer> roomIds = new ArrayList<>();
        List<String> roomNames = new ArrayList<>();
        List<BigDecimal> prices = new ArrayList<>();
        List<Long> nights = new ArrayList<>();
        
        LocalDate earliestCheckIn = null;
        LocalDate latestCheckOut = null;

        for(ReservationRoom rr : rooms) {
            roomIds.add(rr.getRoom().getId());
            roomNames.add(rr.getRoom().getRoomType().getName());
            prices.add(rr.getTotalPrice());
            long d = ChronoUnit.DAYS.between(rr.getCheckInTime(), rr.getCheckOutTime());
            nights.add(d);
            
            if(earliestCheckIn == null || rr.getCheckInTime().isBefore(earliestCheckIn)) {
                earliestCheckIn = rr.getCheckInTime();
            }
            if(latestCheckOut == null || rr.getCheckOutTime().isAfter(latestCheckOut)) {
                latestCheckOut = rr.getCheckOutTime();
            }
        }

        String guestName = r.getGuest().getFirstName()+" "+r.getGuest().getLastName();
        String guestPhone = r.getGuest().getPhone();
        
        ReservationDto dto = new ReservationDto();
        dto.id = r.getId();
        dto.guestName = guestName;
        dto.guestPhone = guestPhone;
        dto.total = r.getTotalAmount();
        dto.status = r.getStatus().name();
        dto.bookingDate = r.getBookingDate();
        dto.roomIds = roomIds;
        dto.roomNames = roomNames;
        dto.prices = prices;
        dto.nights = nights;
        dto.checkIn = earliestCheckIn;
        dto.checkOut = latestCheckOut;
        return dto;
    }

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
}

package com.hotelreservation.module.billing.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import com.hotelreservation.module.reservation.dto.response.ReservationGuestResponse;

public class ResRoomBillResponse {
    private Integer roomId;
    private String resRoomId;
    private LocalDate checkInTime;
    private LocalDate checkOutTime;
    private List<BillResponse> roomBills;
    private List<ReservationGuestResponse> guests;
    private BigDecimal total;
    private BigDecimal totalDue;
    private BigDecimal totalPaid;

    public List<BillResponse> getRoomBills() { return roomBills; }
    public void setRoomBills(List<BillResponse> roomBills) { this.roomBills = roomBills; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public BigDecimal getTotalDue() { return totalDue; }
    public void setTotalDue(BigDecimal totalDue) { this.totalDue = totalDue; }
    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
    public Integer getRoomId() { return roomId;}
    public void setRoomId(Integer roomId) {this.roomId = roomId;}
    public String getResRoomId() { return resRoomId; }
    public void setResRoomId(String resRoomId) { this.resRoomId = resRoomId; }
    public LocalDate getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDate checkInTime) { this.checkInTime = checkInTime; }
    public LocalDate getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalDate checkOutTime) { this.checkOutTime = checkOutTime; }
    public List<ReservationGuestResponse> getGuests() { return guests; }
    public void setGuests(List<ReservationGuestResponse> guests) { this.guests = guests; }
}

package com.hotelreservation.module.billing.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ReservationBillResponse {
    private String reservationId;
    private String guestName;
    private String guestPhone;
    private String guestIdentityNum;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private String hotelName;
    private String hotelAddress;
    private String hotelPhone;
    private List<ResRoomBillResponse> resRoomBill;
    private BigDecimal total;
    private BigDecimal totalDue;
    private BigDecimal totalPaid;

    public String getReservationId() { return reservationId; }
    public void setReservationId(String reservationId) { this.reservationId = reservationId; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }
    public String getGuestIdentityNum() { return guestIdentityNum; }
    public void setGuestIdentityNum(String guestIdentityNum) { this.guestIdentityNum = guestIdentityNum; }
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }
    public String getHotelAddress() { return hotelAddress; }
    public void setHotelAddress(String hotelAddress) { this.hotelAddress = hotelAddress; }
    public String getHotelPhone() { return hotelPhone; }
    public void setHotelPhone(String hotelPhone) { this.hotelPhone = hotelPhone; }
    public List<ResRoomBillResponse> getResRoomBill() { return resRoomBill; }
    public void setResRoomBill(List<ResRoomBillResponse> resRoomBill) { this.resRoomBill = resRoomBill; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public void setTotal() { 
        total = BigDecimal.ZERO;
        if (resRoomBill != null) {
            for(ResRoomBillResponse x : resRoomBill)
                total = total.add(x.getTotal()); 
        }
    }
    public BigDecimal getTotalDue() { return totalDue; }
    public void setTotalDue(BigDecimal totalDue) { this.totalDue = totalDue; }
    public void setTotalDue() { 
        totalDue = BigDecimal.ZERO;
        if (resRoomBill != null) {
            for(ResRoomBillResponse x : resRoomBill)
                totalDue = totalDue.add(x.getTotalDue());
        }
    }
    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }
    public void setTotalPaid() { 
        totalPaid = BigDecimal.ZERO;
        if (resRoomBill != null) {
            for(ResRoomBillResponse x : resRoomBill)
                totalPaid = totalPaid.add(x.getTotalPaid());
        }
    }
}

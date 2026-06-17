package modules.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// không cần để ý

// bill tổng hợp của một resRoom cho người dùng xem
public class ReservationBillSummary {
    private String reservationId;
    private String guestName;      // Tên khách thuê
    private String guestPhone;     // Số điện thoại khách thuê
    private String guestIdentityNum; // CCCD/CMND khách thuê
    private LocalDate checkIn;     // Ngày đến
    private LocalDate checkOut;    // Ngày đi
    private String hotelName;      // Tên khách sạn
    private String hotelAddress;   // Địa chỉ khách sạn
    private String hotelPhone;     // Số điện thoại khách sạn
    private List<ResRoomBillSummary> resRoomBill;
    private BigDecimal total;
    private BigDecimal totalDue;   // tổng UNPAID
    private BigDecimal totalPaid;  // tổng PAID

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
    public List<ResRoomBillSummary> getResRoomBill() { return resRoomBill; }
    public void setResRoomBill(List<ResRoomBillSummary> resRoomBill) { this.resRoomBill = resRoomBill; }
    public BigDecimal getTotal() { return total; }
    public void setTotal() { 
        total = BigDecimal.ZERO;
        for(ResRoomBillSummary x : resRoomBill)
            total = total.add(x.getTotal()); 
    }
    public BigDecimal getTotalDue() { return totalDue; }
    public void setTotalDue() { 
        totalDue = BigDecimal.ZERO;
        for(ResRoomBillSummary x : resRoomBill)
            totalDue = totalDue.add(x.getTotalDue());
    }
    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid() { 
        totalPaid = BigDecimal.ZERO;
        for(ResRoomBillSummary x : resRoomBill)
            totalPaid = totalPaid.add(x.getTotalPaid());
    }
}
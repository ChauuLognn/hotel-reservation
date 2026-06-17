package modules.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import modules.reservation.dto.ReservationPayload.ReservationGuestDto;

// không cần để ý

// bill tổng hợp của một resRoom
public class ResRoomBillSummary {
    private Integer roomId;
    private String resRoomId;
    private LocalDate checkInTime;
    private LocalDate checkOutTime;
    private List<BillDTO> roomBills;
    private List<ReservationGuestDto> guests; // Danh sách khách lưu trú trong phòng
    private BigDecimal total;
    private BigDecimal totalDue;   // tổng UNPAID
    private BigDecimal totalPaid;  // tổng PAID

    
    public List<BillDTO> getRoomBills() { return roomBills; }
    public void setRoomBills(List<BillDTO> roomBills) { this.roomBills = roomBills; }
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
    public List<ReservationGuestDto> getGuests() { return guests; }
    public void setGuests(List<ReservationGuestDto> guests) { this.guests = guests; }
}
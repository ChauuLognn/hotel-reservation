package com.hotelreservation.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.hotelreservation.reservation.dto.ReservationResponses.ReservationGuestResponse;

public class BillingResponses {

    public static class BillResponse {
        private Integer roomId;
        private BigDecimal totalAmount;
        private LocalDateTime date;
        private String reason;
        private String status;

        public Integer getRoomId(){return roomId;}
        public void setRoomId(Integer roomId){this.roomId = roomId;}
        public BigDecimal getTotalAmount(){return totalAmount;}
        public void setTotalAmount(BigDecimal totalAmount){this.totalAmount = totalAmount;}
        public LocalDateTime getDate(){return date;}
        public void setDate(LocalDateTime date){this.date = date;}
        public String getReason(){return reason;}
        public void setReason(String reason){this.reason = reason;}
        public String getStatus(){return status;}
        public void setStatus(String status){this.status = status;}
    }

    public static class ResRoomBillResponse {
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

    public static class ReservationBillResponse {
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

    public interface ReservationBillSummaryProjection {
        String getReservationId();
        BigDecimal getTotalPaid();
        BigDecimal getTotalDue();
        BigDecimal getTotal();
    }
}

package com.hotelreservation.modules.reservation.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hotelreservation.common.enums.ReservationStatus;
import com.hotelreservation.modules.hotelservice.dto.HotelserviceResponses.ReservationServiceResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ReservationResponses {

    public static class GuestStayResponse {
        private String guestName;
        private String identityNum;
        private List<Item> items;

        public static class Item {
            private Integer roomId;
            private LocalDateTime checkInAt;
            private LocalDateTime checkOutAt;

            public Integer getRoomId() { return roomId; }
            public void setRoomId(Integer roomId) { this.roomId = roomId; }
            public LocalDateTime getCheckInAt() { return checkInAt; }
            public void setCheckInAt(LocalDateTime checkInAt) { this.checkInAt = checkInAt; }
            public LocalDateTime getCheckOutAt() { return checkOutAt; }
            public void setCheckOutAt(LocalDateTime checkOutAt) { this.checkOutAt = checkOutAt; }
        }

        public String getIdentityNum() { return identityNum; }
        public void setIdentityNum(String identityNum) { this.identityNum = identityNum; }
        public String getGuestName() { return guestName; }
        public void setGuestName(String guestName) { this.guestName = guestName; }
        public List<Item> getItems() { return items; }
        public void setItems(List<Item> items) { this.items = items; }
    }

    public static class InitialReservationResponse {
        private String reservationId;
        private String guestName;
        private BigDecimal total;
        private HoldResponse hold;

        public InitialReservationResponse(String guestName, HoldResponse hold, String reservationId, BigDecimal total) {
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
        public HoldResponse getHold() { return hold; }
        public void setHold(HoldResponse hold) { this.hold = hold; }
    }

    public static class ReservationFullDetailResponse {
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

    public static class ReservationGuestResponse {
        private Integer guestId;
        private String identityNum;
        private String guestName;
        private LocalDateTime checkInAt;
        private LocalDateTime checkOutAt;

        public Integer getGuestId() { return guestId; }
        public void setGuestId(Integer guestId) { this.guestId = guestId; }
        public String getGuestName() { return guestName; }
        public void setGuestName(String guestName) { this.guestName = guestName; }
        public LocalDateTime getCheckInAt() { return checkInAt; }
        public void setCheckInAt(LocalDateTime checkInAt) { this.checkInAt = checkInAt; }
        public LocalDateTime getCheckOutAt() { return checkOutAt; }
        public void setCheckOutAt(LocalDateTime checkOutAt) { this.checkOutAt = checkOutAt; }
        public String getIdentityNum() { return identityNum; }
        public void setIdentityNum(String identityNum) { this.identityNum = identityNum; }
    }

    public static class ReservationResponse {
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

    public static class ReservationRoomResponse {
        private String id;
        private Integer roomId;
        private LocalDate checkInTime;
        private LocalDate checkOutTime;
        private BigDecimal totalPrice;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public Integer getRoomId() { return roomId; }
        public void setRoomId(Integer roomId) { this.roomId = roomId; }
        public LocalDate getCheckInTime() { return checkInTime; }
        public void setCheckInTime(LocalDate checkInTime) { this.checkInTime = checkInTime; }
        public LocalDate getCheckOutTime() { return checkOutTime; }
        public void setCheckOutTime(LocalDate checkOutTime) { this.checkOutTime = checkOutTime; }
        public BigDecimal getTotalPrice() { return totalPrice; }
        public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    }

    public static class StatusHistoryResponse {
        private Integer roomId;
        private ReservationStatus oldStatus;
        private ReservationStatus newStatus;
        private LocalDateTime updatedAt;
        private String reason;

        public Integer getRoomId() { return roomId; }
        public void setRoomId(Integer roomId) { this.roomId = roomId; }
        public ReservationStatus getOldStatus() { return oldStatus; }
        public void setOldStatus(ReservationStatus oldStatus) { this.oldStatus = oldStatus; }
        public ReservationStatus getNewStatus() { return newStatus; }
        public void setNewStatus(ReservationStatus newStatus) { this.newStatus = newStatus; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}

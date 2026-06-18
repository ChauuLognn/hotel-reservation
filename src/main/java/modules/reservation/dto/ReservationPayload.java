package modules.reservation.dto;

import common.enums.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import modules.reservation.entity.Reservation;
import modules.reservation.entity.ReservationGuest;
import modules.reservation.entity.ReservationRoom;
import modules.reservation.entity.ReservationStatusHistory;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ReservationPayload {

    public static class AvailableRoom {
        private Integer roomId;
        private String name;
        private Byte capacity;
        private BigDecimal baseprice;

        public AvailableRoom(Integer roomId, String name, Byte capacity, BigDecimal baseprice) {
            this.baseprice = baseprice;
            this.capacity = capacity;
            this.name = name;
            this.roomId = roomId;
        }



        public Integer getRoomId() {
            return roomId;
        }

        public void setRoomId(Integer roomId) {
            this.roomId = roomId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Byte getCapacity() {
            return capacity;
        }

        public void setCapacity(Byte capacity) {
            this.capacity = capacity;
        }

        public BigDecimal getBaseprice() {
            return baseprice;
        }

        public void setBaseprice(BigDecimal baseprice) {
            this.baseprice = baseprice;
        }


    }

    public static class CreateHoldRequest {
        @NotNull private Integer guestId;

        @NotNull @Size(min = 1) private List<Item> items;

        public static class Item{
            @NotNull private String roomName;
            @NotNull private Integer rooms;
            @NotNull private LocalDate checkIn;
            @NotNull private LocalDate checkOut;

            public String getRoomName() { return roomName; }
            public void setRoomName(String roomName) { this.roomName = roomName; }
            public Integer getRooms() { return rooms; }
            public void setRooms(Integer rooms) { this.rooms = rooms; }
            public LocalDate getCheckIn() { return checkIn; }
            public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
            public LocalDate getCheckOut() { return checkOut; }
            public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
        }

        public Integer getGuestId() { return guestId; }
        public void setGuestId(Integer guestId) { this.guestId = guestId; }
        public List<Item> getItems() { return items; }
        public void setItems(List<Item> items) { this.items = items; }
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

    public static class ReservationDto {
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
    }

    public static class GuestStayDto {
        private String guestName;
        private String IdentityNum;
        private List<Item> items;

        public static class Item{
            Integer roomId;
            LocalDateTime checkInAt;
            LocalDateTime checkOutAt;
            public Integer getRoomId() {return roomId;}
            public void setRoomId(Integer roomId) {this.roomId = roomId;}
            public LocalDateTime getCheckInAt() {return checkInAt;}
            public void setCheckInAt(LocalDateTime checkInAt) {this.checkInAt = checkInAt;}
            public LocalDateTime getCheckOutAt() {return checkOutAt;}
            public void setCheckOutAt(LocalDateTime checkOutAt) {this.checkOutAt = checkOutAt;}
        }

        public String getIdentityNum() {return IdentityNum;}
        public void setIdentityNum(String IdentityNum) {this.IdentityNum = IdentityNum;}
        public String getGuestName() {return guestName;}
        public void setGuestName(String guestName) {this.guestName = guestName;}
        public List<Item> getItems() {return items;}
        public void setItems(List<Item> items) {this.items = items;}

    }

    public static class ReservationGuestDto {
        private Integer guestId;
        private String IdentityNum;
        private String guestName;
        private LocalDateTime checkInAt;
        private LocalDateTime checkOutAt;

        public static ReservationGuestDto fromEntity(ReservationGuest rg){
            ReservationGuestDto dto = new ReservationGuestDto();
            dto.guestId = rg.getGuest().getId();
            dto.IdentityNum = rg.getGuest().getIdentityNum();
            dto.guestName = rg.getGuest().getFirstName() + " " + rg.getGuest().getLastName();
            dto.checkInAt = rg.getCheckInAt();
            dto.checkOutAt = rg.getCheckOutAt();
            return dto;
        }

        public Integer getGuestId() {return guestId;}
        public void setGuestId(Integer guestId) {this.guestId = guestId;}
        public String getGuestName() {return guestName;}
        public void setGuestName(String guestName) {this.guestName = guestName;}
        public LocalDateTime getCheckInAt() {return checkInAt;}
        public void setCheckInAt(LocalDateTime checkInAt) {this.checkInAt = checkInAt;}
        public LocalDateTime getCheckOutAt() {return checkOutAt;}
        public void setCheckOutAt(LocalDateTime checkOutAt) {this.checkOutAt = checkOutAt;}
        public String getIdentityNum() {return IdentityNum;}
        public void setIdentityNum(String IdentityNum) {this.IdentityNum = IdentityNum;}
    }

    public static class ChangeStatusRequest {
        private ReservationStatus newStatus;
        private String reason;

        public ChangeStatusRequest() {}

        public ChangeStatusRequest(ReservationStatus newStatus, String reason) {
            this.newStatus = newStatus;
            this.reason = reason;
        }


        public ReservationStatus getNewStatus() { return newStatus; }
        public void setNewStatus(ReservationStatus newStatus) { this.newStatus = newStatus; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    public static class ReservationRoomDto {

        private String id; // resRoomId
        private Integer roomId;
        private LocalDate checkInTime;
        private LocalDate checkOutTime;
        private BigDecimal totalPrice;

        public static ReservationRoomDto fromEntity(ReservationRoom rr){
            ReservationRoomDto dto = new ReservationRoomDto();
            dto.id = rr.getId();
            dto.roomId = rr.getRoom().getId();
            dto.setCheckInTime(rr.getCheckInTime());
            dto.setCheckOutTime(rr.getCheckOutTime());
            dto.setTotalPrice(rr.getTotalPrice());
            return dto;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public Integer getRoomId() {
            return roomId;
        }

        public void setRoomId(Integer roomId) {
            this.roomId = roomId;
        }

        public LocalDate getCheckInTime() {
            return checkInTime;
        }

        public void setCheckInTime(LocalDate checkInTime) {
            this.checkInTime = checkInTime;
        }

        public LocalDate getCheckOutTime() {
            return checkOutTime;
        }

        public void setCheckOutTime(LocalDate checkOutTime) {
            this.checkOutTime = checkOutTime;
        }

        public BigDecimal getTotalPrice() {
            return totalPrice;
        }

        public void setTotalPrice(BigDecimal totalPrice) {
            this.totalPrice = totalPrice;
        }


    }

    public static class StatusHistoryDTO {

        private Integer roomId;
        private ReservationStatus oldStatus;
        private ReservationStatus newStatus;
        private LocalDateTime updatedAt;
        private String reason;

        public static StatusHistoryDTO fromEntity(ReservationStatusHistory e){
            StatusHistoryDTO dto = new StatusHistoryDTO();
            dto.roomId = e.getReservationRoom().getRoom().getId();
            dto.oldStatus = e.getOldStatus();
            dto.newStatus = e.getNewStatus();
            dto.updatedAt = e.getUpdatedAt();
            dto.reason = e.getReason();
            return dto;
        }

        public Integer getRoomId(){return roomId;}
        public ReservationStatus getOldStatus(){return oldStatus;}
        public ReservationStatus getNewStatus(){return newStatus;}
        public LocalDateTime getUpdatedAt(){return updatedAt;}
        public String getReason(){return reason;}
    }
}

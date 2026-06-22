package com.hotelreservation.modules.reservation.dto;

import com.hotelreservation.common.enums.ReservationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public class ReservationRequests {

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

    public static class CreateReservationRequest {
        @NotNull private Integer guestId;

        @NotNull @Size(min = 1) private List<RoomItem> items;

        public static class RoomItem {
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
        public List<RoomItem> getItems() { return items; }
        public void setItems(List<RoomItem> items) { this.items = items; }
    }
}

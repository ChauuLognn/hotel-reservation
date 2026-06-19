package com.hotelreservation.module.reservation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public class CreateReservationRequest {
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

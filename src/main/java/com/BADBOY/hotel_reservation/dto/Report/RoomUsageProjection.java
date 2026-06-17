package com.BADBOY.hotel_reservation.dto.Report;

public interface RoomUsageProjection {
    Integer getRoomId();
    String getRoomTypeName();
    Long getTimesBooked();
    Long getTotalNights();
}

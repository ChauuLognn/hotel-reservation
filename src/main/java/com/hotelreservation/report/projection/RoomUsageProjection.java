package com.hotelreservation.report.projection;

public interface RoomUsageProjection {
    Integer getRoomId();
    String getRoomTypeName();
    Long getTimesBooked();
    Long getTotalNights();
}

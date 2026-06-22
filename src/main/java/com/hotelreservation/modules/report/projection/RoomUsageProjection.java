package com.hotelreservation.modules.report.projection;

public interface RoomUsageProjection {
    Integer getRoomId();
    String getRoomTypeName();
    Long getTimesBooked();
    Long getTotalNights();
}

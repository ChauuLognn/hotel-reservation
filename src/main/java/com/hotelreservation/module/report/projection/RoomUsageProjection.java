package com.hotelreservation.module.report.projection;

public interface RoomUsageProjection {
    Integer getRoomId();
    String getRoomTypeName();
    Long getTimesBooked();
    Long getTotalNights();
}

package com.hotelreservation.module.report.dto.response;

import com.hotelreservation.module.report.projection.RoomUsageProjection;

public class RoomUsageItemResponse {
    private Integer roomId;
    private String roomTypeName;
    private Long timesBooked;
    private Long totalNights;

    public static RoomUsageItemResponse fromProjection(RoomUsageProjection p) {
        RoomUsageItemResponse dto = new RoomUsageItemResponse();
        dto.roomId = p.getRoomId();
        dto.roomTypeName = p.getRoomTypeName();
        dto.timesBooked = p.getTimesBooked();
        dto.totalNights = p.getTotalNights();
        return dto;
    }

    public Integer getRoomId(){ return roomId; }
    public void setRoomId(Integer roomId){ this.roomId = roomId; }
    public String getRoomTypeName(){ return roomTypeName; }
    public void setRoomTypeName(String roomTypeName){ this.roomTypeName = roomTypeName; }
    public Long getTimesBooked(){ return timesBooked; }
    public void setTimesBooked(Long timesBooked){ this.timesBooked = timesBooked; }
    public Long getTotalNights(){ return totalNights; }
    public void setTotalNights(Long totalNights){ this.totalNights = totalNights; }
}

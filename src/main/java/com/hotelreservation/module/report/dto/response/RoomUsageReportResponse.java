package com.hotelreservation.module.report.dto.response;

import java.time.LocalDate;
import java.util.List;

public class RoomUsageReportResponse {
    private LocalDate fromDate;
    private LocalDate toDate;
    private List<RoomUsageItemResponse> rooms;
    private RoomUsageItemResponse topRoom;

    public LocalDate getFromDate(){ return fromDate; }
    public void setFromDate(LocalDate fromDate){ this.fromDate = fromDate; }
    public LocalDate getToDate(){ return toDate; }
    public void setToDate(LocalDate toDate){ this.toDate = toDate; }
    public List<RoomUsageItemResponse> getRooms(){ return rooms; }
    public void setRooms(List<RoomUsageItemResponse> rooms){ this.rooms = rooms; }
    public RoomUsageItemResponse getTopRoom(){ return topRoom; }
    public void setTopRoom(RoomUsageItemResponse topRoom){ this.topRoom = topRoom; }
}

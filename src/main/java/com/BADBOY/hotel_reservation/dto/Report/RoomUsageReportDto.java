package com.BADBOY.hotel_reservation.dto.Report;

import java.time.LocalDate;
import java.util.List;

// không cần để ý

// báo cáo cho tất cả phòng trong khoảng from–to
public class RoomUsageReportDto {
    private LocalDate fromDate;
    private LocalDate toDate;
    private List<RoomUsageItemDto> rooms;
    private RoomUsageItemDto topRoom;

    public LocalDate getFromDate(){ return fromDate; }
    public void setFromDate(LocalDate fromDate){ this.fromDate = fromDate; }
    public LocalDate getToDate(){ return toDate; }
    public void setToDate(LocalDate toDate){ this.toDate = toDate; }
    public List<RoomUsageItemDto> getRooms(){ return rooms; }
    public void setRooms(List<RoomUsageItemDto> rooms){ this.rooms = rooms; }
    public RoomUsageItemDto getTopRoom(){ return topRoom; }
    public void setTopRoom(RoomUsageItemDto topRoom){ this.topRoom = topRoom; }
}
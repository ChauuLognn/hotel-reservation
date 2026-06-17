package modules.report.dto;

// không cần để ý

// 1 phòng + số lần đặt + tổng số đêm
public class RoomUsageItemDto {
    private Integer roomId;
    private String roomTypeName;
    private Long timesBooked;
    private Long totalNights;

    public static RoomUsageItemDto fromProjection(RoomUsageProjection p){
        RoomUsageItemDto dto = new RoomUsageItemDto();
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
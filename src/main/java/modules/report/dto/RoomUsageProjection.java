package modules.report.dto;

public interface RoomUsageProjection {
    Integer getRoomId();
    String getRoomTypeName();
    Long getTimesBooked();
    Long getTotalNights();
}
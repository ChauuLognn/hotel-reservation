package modules.room.dto;

import modules.room.entity.Room;

// không cần để ý

// thông tin phòng được trả về để xem
public class RoomDto {
    private Integer id;
    private String typeName;
    private String status;

    public static RoomDto fromEntity(Room entity) {
        RoomDto dto = new RoomDto();
        dto.setId(entity.getId());
        dto.setTypeName(entity.getRoomType().getName());
        dto.setStatus(entity.getStatus().name());
        return dto;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTypeName() {
        return typeName;
    }

    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


}
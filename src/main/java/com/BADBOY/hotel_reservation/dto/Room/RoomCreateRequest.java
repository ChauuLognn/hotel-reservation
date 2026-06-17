package com.BADBOY.hotel_reservation.dto.Room;

//không cần để ý

// thông tin tạo phòng
public class RoomCreateRequest {
    private Integer id;
    private String typeName;
    private String status;

    
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

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }


}

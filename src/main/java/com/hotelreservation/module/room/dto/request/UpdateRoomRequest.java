package com.hotelreservation.module.room.dto.request;

import jakarta.validation.constraints.*;

public class UpdateRoomRequest {
    @NotNull(message = "Số phòng không được để trống")
    private Integer id;

    @NotBlank(message = "Loại phòng không được để trống")
    private String typeName;

    @NotBlank(message = "Trạng thái không được để trống")
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

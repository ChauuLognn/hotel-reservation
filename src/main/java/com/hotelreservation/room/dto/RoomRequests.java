package com.hotelreservation.room.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public class RoomRequests {

    public static class CreateRoomRequest {
        @NotNull(message = "Số phòng không được để trống")
        private Integer id;

        @NotBlank(message = "Loại phòng không được để trống")
        private String typeName;

        @NotBlank(message = "Trạng thái không được để trống")
        private String status;

        public String getTypeName() { return typeName; }
        public void setTypeName(String typeName) { this.typeName = typeName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
    }

    public static class CreateRoomTypeRequest {
        @NotBlank(message = "Tên loại phòng không được để trống")
        private String name;

        @NotNull(message = "Sức chứa không được để trống")
        @Min(value = 1, message = "Sức chứa tối thiểu là 1 người")
        private Byte capacity;

        @NotNull(message = "Giá cơ bản không được để trống")
        @DecimalMin(value = "0.0", message = "Giá cơ bản phải lớn hơn hoặc bằng 0")
        private BigDecimal basePrice;
        private String description;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Byte getCapacity() { return capacity; }
        public void setCapacity(Byte capacity) { this.capacity = capacity; }
        public BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class UpdateRoomRequest {
        @NotNull(message = "Số phòng không được để trống")
        private Integer id;

        @NotBlank(message = "Loại phòng không được để trống")
        private String typeName;

        @NotBlank(message = "Trạng thái không được để trống")
        private String status;

        public String getTypeName() { return typeName; }
        public void setTypeName(String typeName) { this.typeName = typeName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
    }

    public static class UpdateRoomTypeRequest {
        @NotBlank(message = "Tên loại phòng không được để trống")
        private String name;

        @NotNull(message = "Sức chứa không được để trống")
        @Min(value = 1, message = "Sức chứa tối thiểu là 1 người")
        private Byte capacity;

        @NotNull(message = "Giá cơ bản không được để trống")
        @DecimalMin(value = "0.0", message = "Giá cơ bản phải lớn hơn hoặc bằng 0")
        private BigDecimal basePrice;
        private String description;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Byte getCapacity() { return capacity; }
        public void setCapacity(Byte capacity) { this.capacity = capacity; }
        public BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
}

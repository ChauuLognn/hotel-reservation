package com.hotelreservation.modules.room.dto;

import java.math.BigDecimal;

public class RoomResponses {

    public static class AvailableRoomResponse {
        private Integer roomId;
        private String name;
        private Byte capacity;
        private BigDecimal basePrice;

        public AvailableRoomResponse() {}

        public AvailableRoomResponse(Integer roomId, String name, Byte capacity, BigDecimal basePrice) {
            this.basePrice = basePrice;
            this.capacity = capacity;
            this.name = name;
            this.roomId = roomId;
        }

        public Integer getRoomId() { return roomId; }
        public void setRoomId(Integer roomId) { this.roomId = roomId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Byte getCapacity() { return capacity; }
        public void setCapacity(Byte capacity) { this.capacity = capacity; }
        public BigDecimal getBasePrice() { return basePrice; }
        public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    }

    public static class RoomResponse {
        private Integer id;
        private String typeName;
        private String status;

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
        public String getTypeName() { return typeName; }
        public void setTypeName(String typeName) { this.typeName = typeName; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class RoomTypeResponse {
        private String name;
        private Byte capacity;
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

package com.hotelreservation.hotelservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class HotelserviceResponses {

    public static class HotelServiceResponse {
        private Integer id;
        private String name;
        private BigDecimal price;
        private String status;

        public HotelServiceResponse() {}

        public HotelServiceResponse(Integer id, String name, BigDecimal price, String status) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.status = status;
        }

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ReservationServiceResponse {
        private String id;
        private Integer roomId;
        private String service;
        private Byte quantity;
        private BigDecimal totalAmount;
        private LocalDateTime usedAt;
        private Integer createdBy;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public Integer getRoomId() { return roomId; }
        public void setRoomId(Integer roomId) { this.roomId = roomId; }

        public String getService() { return service; }
        public void setService(String service) { this.service = service; }

        public Byte getQuantity() { return quantity; }
        public void setQuantity(Byte quantity) { this.quantity = quantity; }

        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

        public LocalDateTime getUsedAt() { return usedAt; }
        public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }

        public Integer getCreatedBy() { return createdBy; }
        public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }
    }
}

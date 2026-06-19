<<<<<<<< HEAD:src/main/java/modules/hotelservice/dto/ReservationServiceDto.java
package modules.hotelservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import modules.hotelservice.entity.ReservationService;

// trigger re-indexing

// thông tin dịch vụ được resRoom sử dụng có thể xem
public class ReservationServiceDto {
========
package com.hotelreservation.module.hotelservice.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
public class ReservationServiceResponse {
>>>>>>>> cbefeac3b6cddeb05a11784a799ae6ee9e5b4f93:src/main/java/com/hotelreservation/module/hotelservice/dto/response/ReservationServiceResponse.java
    private String id;
    private Integer roomId;
    private String service;
    private Byte quantity;
    private BigDecimal totalAmount;
    private LocalDateTime usedAt;
    private Integer createdBy;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public Byte getQuantity() {
        return quantity;
    }

    public void setQuantity(Byte quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }

    public Integer getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Integer createdBy) {
        this.createdBy = createdBy;
    }
}

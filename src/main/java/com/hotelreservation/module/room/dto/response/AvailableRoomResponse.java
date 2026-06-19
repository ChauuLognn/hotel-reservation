package com.hotelreservation.module.room.dto.response;

import java.math.BigDecimal;

public class AvailableRoomResponse {
    private Integer roomId;
    private String name;
    private Byte capacity;
    private BigDecimal baseprice;

    public AvailableRoomResponse() {
    }

    public AvailableRoomResponse(Integer roomId, String name, Byte capacity, BigDecimal baseprice) {
        this.baseprice = baseprice;
        this.capacity = capacity;
        this.name = name;
        this.roomId = roomId;
    }

    public Integer getRoomId() {
        return roomId;
    }

    public void setRoomId(Integer roomId) {
        this.roomId = roomId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Byte getCapacity() {
        return capacity;
    }

    public void setCapacity(Byte capacity) {
        this.capacity = capacity;
    }

    public BigDecimal getBaseprice() {
        return baseprice;
    }

    public void setBaseprice(BigDecimal baseprice) {
        this.baseprice = baseprice;
    }
}

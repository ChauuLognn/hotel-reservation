package com.BADBOY.hotel_reservation.dto.reservation;

import java.math.BigDecimal;

// không cần để ý

// thông tin phòng khả dụng trả về cho người dùng xemm
public class AvailableRoom {
    private Integer roomId;
    private String name;
    private Byte capacity;
    private BigDecimal baseprice;

    public AvailableRoom(Integer roomId, String name, Byte capacity, BigDecimal baseprice) {
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

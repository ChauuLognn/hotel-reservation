package com.hotelreservation.module.billing.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
public class BillResponse {
    private Integer roomId;
    private BigDecimal totalAmount;
    private LocalDateTime date;
    private String reason;
    private String status;

    public Integer getRoomId(){return roomId;}
    public void setRoomId(Integer roomId){this.roomId = roomId;}
    public BigDecimal getTotalAmount(){return totalAmount;}
    public void setTotalAmount(BigDecimal totalAmount){this.totalAmount = totalAmount;}
    public LocalDateTime getDate(){return date;}
    public void setDate(LocalDateTime date){this.date = date;}
    public String getReason(){return reason;}
    public void setReason(String reason){this.reason = reason;}
    public String getStatus(){return status;}
    public void setStatus(String status){this.status = status;}
}

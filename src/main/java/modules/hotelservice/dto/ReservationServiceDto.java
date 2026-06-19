package modules.hotelservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import modules.hotelservice.entity.ReservationService;

// trigger re-indexing

// thông tin dịch vụ được resRoom sử dụng có thể xem
public class ReservationServiceDto {
    private String id;
    private Integer roomId;
    private String service;
    private Byte quantity;
    private BigDecimal totalAmount;
    private LocalDateTime usedAt;
    private Integer createdBy;

    static public ReservationServiceDto fromEntity(ReservationService rS){
        ReservationServiceDto dto = new ReservationServiceDto();
        dto.setId(rS.getId());
        dto.setRoomId(rS.getReservationRoom().getRoom().getId());
        dto.setService(rS.getService().getName());
        dto.setQuantity(rS.getQuantity());
        dto.setTotalAmount(rS.getTotalAmount());
        dto.setUsedAt(rS.getUsedAt());
        dto.createdBy = rS.getCreatedBy().getId();
        return dto;
    }

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
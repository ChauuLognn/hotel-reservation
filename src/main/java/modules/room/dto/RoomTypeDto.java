package modules.room.dto;

import java.math.BigDecimal;

import modules.room.entity.RoomType;

// không cần để ý

// thông tin loại phòng được trả về để xem
public class RoomTypeDto {
    private String name;
    private Byte capacity;
    private BigDecimal basePrice;
    private String description;

    public static RoomTypeDto fromEntity(RoomType rt){
        RoomTypeDto dto = new RoomTypeDto();
        dto.setName(rt.getName());
        dto.setCapacity(rt.getCapacity());
        dto.setBasePrice(rt.getBasePrice());
        dto.setDescription(rt.getDescription());
        return dto;
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

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


}
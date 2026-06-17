package modules.room.dto;

import java.math.BigDecimal;

// không cần để ý

// thông tin tạo loại phòng
public class RoomTypeCreateRequest {
    private String name;
    private Byte capacity;
    private BigDecimal basePrice;
    private String description;

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
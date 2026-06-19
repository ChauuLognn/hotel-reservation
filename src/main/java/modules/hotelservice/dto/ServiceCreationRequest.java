package modules.hotelservice.dto;

import java.math.BigDecimal;

// không cần để ý

// thông tin tạo dịch vụ
public class ServiceCreationRequest {
    private String name;
    private BigDecimal price;
    private String status;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
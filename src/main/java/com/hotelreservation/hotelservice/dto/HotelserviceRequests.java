package com.hotelreservation.hotelservice.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public class HotelserviceRequests {

    public static class AddReservationServiceRequest {
        private String name;
        private Integer quantity;

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class CreateServiceRequest {
        @NotBlank(message = "Tên dịch vụ không được để trống")
        private String name;

        @NotNull(message = "Giá dịch vụ không được để trống")
        @DecimalMin(value = "0.0", message = "Giá dịch vụ phải lớn hơn hoặc bằng 0")
        private BigDecimal price;

        @NotBlank(message = "Trạng thái không được để trống")
        private String status;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class UpdateServiceRequest {
        @NotBlank(message = "Tên dịch vụ không được để trống")
        private String name;

        @NotNull(message = "Giá dịch vụ không được để trống")
        @DecimalMin(value = "0.0", message = "Giá dịch vụ phải lớn hơn hoặc bằng 0")
        private BigDecimal price;

        @NotBlank(message = "Trạng thái không được để trống")
        private String status;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}

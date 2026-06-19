<<<<<<<< HEAD:src/main/java/modules/hotelservice/dto/ServiceCreationRequest.java
package modules.hotelservice.dto;
========
package com.hotelreservation.module.hotelservice.dto.request;
>>>>>>>> cbefeac3b6cddeb05a11784a799ae6ee9e5b4f93:src/main/java/com/hotelreservation/module/hotelservice/dto/request/CreateServiceRequest.java

import java.math.BigDecimal;

public class CreateServiceRequest {
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

<<<<<<<< HEAD:src/main/java/modules/hotelservice/entity/Service.java
package modules.hotelservice.entity;
========
package com.hotelreservation.module.hotelservice.entity;
>>>>>>>> cbefeac3b6cddeb05a11784a799ae6ee9e5b4f93:src/main/java/com/hotelreservation/module/hotelservice/entity/HotelService.java

import java.math.BigDecimal;
import com.hotelreservation.common.enums.ServiceStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "service")
public class HotelService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ServiceStatus status;

    public Integer getId(){return id;}
    public void setId(Integer id){this.id = id;}
    public String getName(){return name;}
    public void setName(String name){this.name = name;}
    public BigDecimal getPrice(){return price;}
    public void setPrice(BigDecimal price){this.price = price;}
    public ServiceStatus getStatus(){return status;}
    public void setStatus(ServiceStatus status){this.status = status;}
}

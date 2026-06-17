package com.BADBOY.hotel_reservation.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "roomType")
public class RoomType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "capacity", nullable = false)
    private Byte capacity;

    @Column(name = "basePrice", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "description", length = 255)
    private String description;

    public Integer getId(){return id;}
    public void setId(Integer id){this.id = id;}
    public String getName(){return name;}
    public void setName(String name){this.name = name;}
    public Byte getCapacity(){return capacity;}
    public void setCapacity(Byte capacity){this.capacity = capacity;}
    public BigDecimal getBasePrice(){return basePrice;}
    public void setBasePrice(BigDecimal basePrice){this.basePrice = basePrice;}
    public String getDescription(){return description;}
    public void setDescription(String description){this.description = description;}
}

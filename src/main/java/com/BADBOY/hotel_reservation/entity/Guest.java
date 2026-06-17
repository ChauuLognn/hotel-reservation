package com.BADBOY.hotel_reservation.entity;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "guest")
public class Guest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "firstName", nullable = false, length = 50)
    private String firstName;

    @Column(name = "lastName", nullable = false, length = 50)
    private String lastName;

    @Column(name = "identityNum", length = 50, unique = true)
    private String identityNum;

    @Column(name = "phone", length = 50, unique = true)
    private String phone;

    @Column(name = "dateOfBirth")
    private LocalDate dateOfBirth;

    public Integer getId(){return id;}
    public void setId(Integer id){this.id = id;}
    public String getFirstName(){return firstName;}
    public void setFirstName(String firstName){this.firstName = firstName;}
    public String getLastName(){return lastName;}
    public void setLastName(String lastName){this.lastName = lastName;}
    public String getIdentityNum(){return identityNum;}
    public void setIdentityNum(String identityNum){this.identityNum = identityNum;}
    public String getPhone(){return phone;}
    public void setPhone(String phone){this.phone = phone;}
    public LocalDate getDateOfBirth(){return dateOfBirth;}
    public void setDateOfBirth(LocalDate dateOfBirth){this.dateOfBirth = dateOfBirth;}
}

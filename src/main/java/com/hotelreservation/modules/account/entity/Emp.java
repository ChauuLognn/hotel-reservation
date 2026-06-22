package com.hotelreservation.modules.account.entity;

import com.hotelreservation.common.audit.BaseEntity;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "emp")
public class Emp extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "firstName", nullable = false, length = 50)
    private String firstName;

    @Column(name = "lastName", nullable = false, length = 50)
    private String lastName;

    @Column(name = "dateOfBirth")
    private LocalDate dateOfBirth;

    @Column(name = "identityNum", nullable = false, length = 50, unique = true)
    private String identityNum;

    @Column(name = "email", nullable = false, length = 50, unique = true)
    private String email;

    @Column(name = "phone", nullable = false, length = 50, unique = true)
    private String phone;

    @Column(name = "address", length = 255)
    private String address;

    @ManyToOne
    @JoinColumn(
        name = "role",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_emp_role")
    )
    private Role role;

    public Integer getId(){return id;}
    public void setId(Integer id){this.id = id;}
    public String getFirstName(){return firstName;}
    public void setFirstName(String firstName){this.firstName = firstName;}
    public String getLastName(){return lastName;}
    public void setLastName(String lastName){this.lastName = lastName;}
    public LocalDate getDateOfBirth(){return dateOfBirth;}
    public void setDateOfBirth(LocalDate dateOfBirth){this.dateOfBirth = dateOfBirth;}
    public String getIdentityNum(){return identityNum;}
    public void setIdentityNum(String identityNum){this.identityNum = identityNum;}
    public String getEmail(){return email;}
    public void setEmail(String email){this.email = email;}
    public String getPhone(){return phone;}
    public void setPhone(String phone){this.phone = phone;}
    public String getAddress(){return address;}
    public void setAddress(String address){this.address = address;}
    public Role getRole(){return role;}
    public void setRole(Role role){this.role = role;}
}
package com.hotelreservation.account.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "user", indexes = {
    @Index(name = "idx_user_account", columnList = "account"),
    @Index(name = "idx_user_emp", columnList = "empId"),
    @Index(name = "idx_user_guest", columnList = "guestId")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "empId",
        nullable = true,
        foreignKey = @ForeignKey(name = "FK_user_emp")
    )
    private Emp emp;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "guestId",
        nullable = true,
        foreignKey = @ForeignKey(name = "FK_user_guest")
    )
    private Guest guest;

    @Column(name = "account", nullable = false, length = 50, unique = true)
    private String account;

    @Column(name = "password", nullable = false, length = 255)
    @JsonIgnore
    private String password;

    public Integer getId(){return id;}
    public void setId(Integer id){this.id = id;}
    public Emp getEmp(){return emp;}
    public void setEmp(Emp emp){this.emp = emp;}
    public Guest getGuest(){return guest;}
    public void setGuest(Guest guest){this.guest = guest;}
    public String getAccount(){return account;}
    public void setAccount(String account){this.account = account;}
    public String getPassword(){return password;}
    public void setPassword(String password){this.password = password;}
}

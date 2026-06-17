// package com.BADBOY.hotel_reservation.entity;

// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.ForeignKey;
// import jakarta.persistence.Id;
// import jakarta.persistence.JoinColumn;
// import jakarta.persistence.ManyToOne;
// import jakarta.persistence.Table;

// @Entity
// @Table(name = "roomHold")
// public class RoomHold {

//     @Id
//     @Column(name = "id", nullable = false, length = 36)
//     private String id; // CHAR(36) - generate UUID ở service

//     @ManyToOne
//     @JoinColumn(
//         name = "guestId",
//         nullable = false,
//         foreignKey = @ForeignKey(name = "FK_roomhold_guest")
//     )
//     private Guest guest;

//     @ManyToOne
//     @JoinColumn(
//         name = "roomId",
//         nullable = false,
//         foreignKey = @ForeignKey(name = "FK_roomhold_room")
//     )
//     private Room room;

//     @Column(name = "finalPrice", nullable = false, precision = 10, scale = 2)
//     private BigDecimal finalPrice;

//     @Column(name = "checkIn", nullable = false)
//     private LocalDate checkIn;

//     @Column(name = "checkOut", nullable = false)
//     private LocalDate checkOut;

//     @Column(name = "expiresAt", nullable = false)
//     private LocalDateTime expiresAt;

//     @Column(name = "token", nullable = false, length = 64, unique = true)
//     private String token;

//     @Column(name = "createdAt", nullable = false)
//     private LocalDateTime createdAt = LocalDateTime.now();

//     public String getId(){return id;}
//     public void setId(String id){this.id = id;}
//     public Guest getGuest(){return guest;}
//     public void setGuest(Guest guest){this.guest = guest;}
//     public Room getRoom(){return room;}
//     public void setRoom(Room room){this.room = room;}
//     public BigDecimal getFinalPrice(){return finalPrice;}
//     public void setFinalPrice(BigDecimal finalPrice){this.finalPrice = finalPrice;}
//     public LocalDate getCheckIn(){return checkIn;}
//     public void setCheckIn(LocalDate checkIn){this.checkIn = checkIn;}
//     public LocalDate getCheckOut(){return checkOut;}
//     public void setCheckOut(LocalDate checkOut){this.checkOut = checkOut;}
//     public LocalDateTime getExpiresAt(){return expiresAt;}
//     public void setExpiresAt(LocalDateTime expiresAt){this.expiresAt = expiresAt;}
//     public String getToken(){return token;}
//     public void setToken(String token){this.token = token;}
//     public LocalDateTime getCreatedAt(){return createdAt;}
//     public void setCreatedAt(LocalDateTime createdAt){this.createdAt = createdAt;}
// }

package com.BADBOY.hotel_reservation.entity;

import com.BADBOY.hotel_reservation.entity.Enum.RoomStatus;

import jakarta.persistence.*;

@Entity
@Table(name = "room")
public class Room {

    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(
        name = "typeId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_room_roomtype")
    )
    private RoomType roomType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RoomStatus status;

    public Integer getId(){return id;}
    public void setId(Integer id){this.id = id;}
    public RoomType getRoomType(){return roomType;}
    public void setRoomType(RoomType roomType){this.roomType = roomType;}
    public RoomStatus getStatus(){return status;}
    public void setStatus(RoomStatus status){this.status = status;}
}

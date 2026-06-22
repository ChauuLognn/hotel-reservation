package com.hotelreservation.modules.room.entity;

import com.hotelreservation.common.audit.BaseEntity;
import com.hotelreservation.common.enums.RoomStatus;

import jakarta.persistence.*;

@Entity
@Table(name = "room", indexes = {
    @Index(name = "idx_room_type", columnList = "typeId"),
    @Index(name = "idx_room_status", columnList = "status")
})
public class Room extends BaseEntity {

    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
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

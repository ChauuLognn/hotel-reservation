package com.BADBOY.hotel_reservation.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.BADBOY.hotel_reservation.dto.Room.RoomCreateRequest;
import com.BADBOY.hotel_reservation.dto.Room.RoomDto;
import com.BADBOY.hotel_reservation.dto.Room.RoomTypeCreateRequest;
import com.BADBOY.hotel_reservation.dto.Room.RoomTypeDto;
import com.BADBOY.hotel_reservation.dto.reservation.AvailableRoom;
import com.BADBOY.hotel_reservation.service.RoomDomain;
import com.BADBOY.hotel_reservation.service.RoomTypeDomain;

@RestController
@RequestMapping("/api/rooms")
public class RoomCotroller {
    @Autowired private RoomDomain rDomain;
    @Autowired private RoomTypeDomain rTDomain;


    // tìm các phòng thỏa mãn yêu cầu của khách 
    @GetMapping("/available")
    public List<AvailableRoom> findAvailableRooms(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ){        
        return rDomain.findAvaiableRooms(name, checkIn, checkOut);
    }

    // tạo một phòng mới
    @PostMapping
    public RoomDto createRoom(@RequestBody RoomCreateRequest rq){
        return rDomain.create(rq);
    }

    // lấy ra tất cả các phòng của khách sạn
    @GetMapping
    public List<RoomDto> getAllRoom(){
        return rDomain.getAll();
    }

    // lấy thông tin của một phòng theo id
    @GetMapping("/{id}")
    public RoomDto getRoomById(@PathVariable Integer id){
        return rDomain.getById(id);
    }

    // cập nhật phòng theo id
    @PutMapping("/{id}")
    public RoomDto updateRoom(@PathVariable Integer id, @RequestBody RoomCreateRequest rq){
        return rDomain.update(id, rq);
    }

    // xóa phòng theo id
    @DeleteMapping("/{id}")
    public String deleteRoom(@PathVariable Integer id){
        rDomain.delete(id);
        return "Deleted room successfully";
    }

    // tạo loại phòng mới
    @PostMapping("/roomTypes")
    public RoomTypeDto createRoomType(@RequestBody RoomTypeCreateRequest rq){
        return rTDomain.create(rq);
    }

    // lấy thông tin của mọi loại phòng
    @GetMapping("/roomTypes")
    public List<RoomTypeDto> getAllRoomType(){
        return rTDomain.getAll();
    }

    // lấy thông tin của loại phòng theo tên 
    @GetMapping("/roomTypes/{name}")
    public RoomTypeDto getRoomTypeByName(@PathVariable String name){
        return rTDomain.getByName(name);
    }

    // cập nhật loại phòng theo tên
    @PutMapping("/roomTypes/{name}")
    public RoomTypeDto updateRoomType(@PathVariable String name, @RequestBody RoomTypeCreateRequest rq){
        return rTDomain.update(name, rq);
    }

    // xóa phòng theo tên
    @DeleteMapping("/roomTypes/{name}")
    public String delete(@PathVariable String name){
        rTDomain.delete(name);
        return "Deleted successfully";
    }
}

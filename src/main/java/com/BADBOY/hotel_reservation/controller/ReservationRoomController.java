package com.BADBOY.hotel_reservation.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.BADBOY.hotel_reservation.dto.ReservationGuest.ReservationGuestDto;
import com.BADBOY.hotel_reservation.dto.ReservationRoom.ReservationRoomDto;
import com.BADBOY.hotel_reservation.dto.Service.ReservationServiceCreationRequest;
import com.BADBOY.hotel_reservation.dto.Service.ReservationServiceDto;
import com.BADBOY.hotel_reservation.service.ReservationRoomDomain;
import com.BADBOY.hotel_reservation.service.Serviceee.ReservationServiceDomain;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reservation-rooms/{resRoomId}")
public class ReservationRoomController {
    @Autowired private ReservationRoomDomain resRoomDomain;
    @Autowired private ReservationServiceDomain rSDomain;

    // lấy thông tin của resRoom thông qua id
    @GetMapping()
    public ReservationRoomDto getById(@PathVariable String resRoomId){
        return resRoomDomain.getResRoomById(resRoomId);
    }
    
    // lấy thông tin lưu trú của các khách ở trong resRoomId
    @GetMapping("/guestStays")
    public List<ReservationGuestDto> getResGuestsByResRoom(@PathVariable String resRoomId){
        return resRoomDomain.getResGuestByResRoom(resRoomId);
    }

    // xóa resRoom
    @DeleteMapping()
    public String delete(@PathVariable String resRoomId){
        resRoomDomain.delete(resRoomId);
        return "ReservationRoom deleted successfully";
    }

    // lấy ra các lần sử dụng dịch vụ của một resRoom
    @GetMapping("/services")
    public List<ReservationServiceDto> getServicesOfResRoom(@PathVariable String resRoomId){
        return rSDomain.getAllOfResRoom(resRoomId);
    }

    // ghi lại dịch vụ được sử dụng bởi resRoom nào
    @PostMapping("/services")
    public String createResService(@PathVariable String resRoomId, 
                    @RequestBody @Valid ReservationServiceCreationRequest rq,
                    @RequestHeader("X-User_id") Integer userId){
        rSDomain.create(resRoomId, rq, userId);    
        return "ok";                
    }

    // xóa thông tin dịch vụ sử dụng của resRoom
    @DeleteMapping("/services/{serId}")
    public String deleteResService(@PathVariable String id){
        rSDomain.delete(id);
        return "ReservationService deleted successfully";
    }
}

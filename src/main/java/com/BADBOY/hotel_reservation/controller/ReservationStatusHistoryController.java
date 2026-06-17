package com.BADBOY.hotel_reservation.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.BADBOY.hotel_reservation.dto.ReservationRoom.ChangeStatusRequest;
import com.BADBOY.hotel_reservation.dto.ReservationRoom.StatusHistoryDTO;
import com.BADBOY.hotel_reservation.service.ReservationStatusHistoryDomain;

@RestController
@RequestMapping("/api/reservationStatus/{resId}")
public class ReservationStatusHistoryController {
    @Autowired private ReservationStatusHistoryDomain statusHistoryDomain;

    // lấy toàn bộ bản ghi thay đổi trạng thái của mọi resRoom thuộc cùng một reservation
    @GetMapping
    public List<StatusHistoryDTO> getByReservation(@PathVariable String resId){
        return statusHistoryDomain.getHistoryByReservation(resId);
    }

    // lấy toàn bộ bản ghi thay đổi trạng thái của một resRoom
    @GetMapping("/resRooms/{resRoomId}")
    public List<StatusHistoryDTO> getByResRoom(@PathVariable String resRoomId){
        return statusHistoryDomain.getHistoryByReservationRoom(resRoomId);
    }

    // Cập nhật trạng thái cho reservation
    @PostMapping("/status")
    public ResponseEntity<Void> updateReservationStatus(
            @PathVariable String resId,
            @RequestBody ChangeStatusRequest req,
            @RequestHeader("X-User-Id") Integer userId) {
        statusHistoryDomain.updateReservationStatus(resId, req, userId);
        return ResponseEntity.noContent().build();
    }

    // trạng thái của mỗi resRoom được cập nhật tự động thông qua trạng thái của reservation
    // hoặc hành động checkIn, checkOut của khách trong resRoom đó
}

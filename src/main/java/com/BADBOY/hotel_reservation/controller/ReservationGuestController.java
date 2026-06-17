package com.BADBOY.hotel_reservation.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.BADBOY.hotel_reservation.dto.ReservationGuest.ReservationGuestDto;
import com.BADBOY.hotel_reservation.service.ReservationGuestDomain;

@RestController
@RequestMapping("/api/reservation-guests")
public class ReservationGuestController {
    @Autowired private ReservationGuestDomain resGuestDomain;

    // Lấy danh sách khách đã đăng ký lưu trú cho một ReservationRoom
    @GetMapping("/reservation-room/{resRoomId}")
    public List<ReservationGuestDto> getGuestsByResRoom(@PathVariable String resRoomId) {
        return resGuestDomain.getGuestsByResRoomId(resRoomId);
    }

    // Đăng ký khách cho ReservationRoom - endpoint đơn giản hơn
    @PostMapping("/register")
    public ReservationGuestDto registerGuest(@RequestParam String resRoomId,
                                             @RequestParam Integer guestId) {
        return resGuestDomain.createReservationGuest(resRoomId, guestId);
    }

    // Legacy endpoints - Backward compatible
    // thêm khách vào resRoom
    @PostMapping("/resRoomId={resRoomId}-guestId={guestId}")
    public void createReservationGuestLegacy(@PathVariable String resRoomId,
                            @PathVariable Integer guestId){
        resGuestDomain.createReservationGuest(resRoomId, guestId);
    }

    // checkIn cho khách của resRoom  
    @PostMapping("/resRoomId={resRoomId}-guestId={guestId}/checkIn")
    public ReservationGuestDto checkIn(@PathVariable String resRoomId,
                                @PathVariable Integer guestId,
                                @RequestBody(required=false) LocalDateTime checkInAt){
        return resGuestDomain.setCheckIn(resRoomId, guestId, checkInAt);                           
    }

    // checkOut cho khách của resRoom
    @PostMapping("/resRoomId={resRoomId}-guestId={guestId}/checkOut")
    public ReservationGuestDto checkOut(@PathVariable String resRoomId,
                                @PathVariable Integer guestId,
                                @RequestBody(required=false) LocalDateTime checkOutAt) {
        return resGuestDomain.setCheckOut(resRoomId,guestId,checkOutAt);
    }
}

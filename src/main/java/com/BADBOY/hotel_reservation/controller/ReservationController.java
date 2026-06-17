package com.BADBOY.hotel_reservation.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.BADBOY.hotel_reservation.dto.ReservationRoom.ReservationRoomDto;
import com.BADBOY.hotel_reservation.dto.reservation.CreateHoldRequest;
import com.BADBOY.hotel_reservation.dto.reservation.InitialReservationResponse;
import com.BADBOY.hotel_reservation.dto.reservation.ReservationDto;
import com.BADBOY.hotel_reservation.service.ReservationDomain;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {
    @Autowired
    private ReservationDomain resDomain;
    // lấy ra các 
    
    @GetMapping()
    public ReservationDto getByResId(@RequestParam String resId){
        return resDomain.getByResId(resId);
    }

    // lấy ra tất cả các reservation
    @GetMapping("/all")
    public List<ReservationDto> getAllReservations(){
        return resDomain.getAllReservations();
    }
    
    // chốt bản nháp -> tạo bản ghi reservation với status = PENDING_PAYMENT
    @PostMapping()
    public InitialReservationResponse confirmHold(@RequestHeader("X-User-Id") Integer userId,
                                        @RequestBody @Valid CreateHoldRequest req){
        return resDomain.createReservationFromRequest(req, userId);
    }

    // lấy ra các reservation của một khách
    @GetMapping("/guests/{guestId}")
    public List<ReservationDto> getAllResByGuestId(@PathVariable Integer guestId){
        return resDomain.getAllResByGuestId(guestId);
    }

    // lấy ra reservation mới nhất của khách
    @GetMapping("/guests/{guestId}/latestRes")
    public ReservationDto getLastResByGuestId(@PathVariable Integer guestId){
        return resDomain.getLastResByGuestId(guestId);
    }
    
    // lấy ra các phòng được đặt của một reservation
    @GetMapping("/{resId}")
    public List<ReservationRoomDto> getResRoomByResId(@PathVariable String resId){
        return resDomain.getResRoomByResId(resId);
    }
    // lấy ra chi tiết reservation theo ID - endpoint mới cho booking-detail.html
    @GetMapping("/{resId}/detail")
    public ReservationDto getReservationDetail(@PathVariable String resId){
        return resDomain.getByResId(resId);
    }

    // chưa biết xử lý xóa reservation thế nào tại nó tham chiếu nhiều vãi bìu
    
    // @DeleteMapping("/{resId}")
    // public String delete(@PathVariable Integer resId){
    //     resDomain.delete(resId);
    //     return "Reservation deleted successfully";
    // }
}

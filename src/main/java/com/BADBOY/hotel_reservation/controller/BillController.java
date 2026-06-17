package com.BADBOY.hotel_reservation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.BADBOY.hotel_reservation.dto.billDto.ResRoomBillSummary;
import com.BADBOY.hotel_reservation.dto.billDto.ReservationBillSummary;
import com.BADBOY.hotel_reservation.service.BillDomain;

@RestController
@RequestMapping("/api/reservations/{resId}/bills")
public class BillController {

    @Autowired private BillDomain billDomain;

    // đánh dấu mọi bill của reservation thành paid
    @PostMapping
    public void ConfirmedPaidBillsForResId(@PathVariable String resId){
        billDomain.ConfirmedPaidBillsForResId(resId);
    }

    // đánh dấu mọi bill của resRoom thành paid
    @PostMapping("/reservation-rooms/{resRoomId}")
    public void ConfirmedPaidBillsForResRoomId(@PathVariable String resRoomId){
        billDomain.ConfirmedPaidBillsForResRoomId(resRoomId);
    }
    
    // lấy ra các bill của reservation
    @GetMapping()
    public ReservationBillSummary createReservationBillSummary(@PathVariable String resId){
        return billDomain.createReservationBillSummary(resId);
    }

    // lấy ra các bill của resRoom
    @GetMapping("/reservation-rooms/{resRoomId}")
    public ResRoomBillSummary createResRoomBillSummary(@PathVariable String resRoomId){
        return billDomain.createResRoomBillSummary(resRoomId);
    }
}

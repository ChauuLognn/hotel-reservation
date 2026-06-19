package com.hotelreservation.module.billing.controller;

import com.hotelreservation.module.billing.dto.response.ResRoomBillResponse;
import com.hotelreservation.module.billing.dto.response.ReservationBillResponse;
import com.hotelreservation.module.billing.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BillingController {

    @Autowired private BillService billService;

    @PostMapping("/api/reservations/{resId}/bills")
    public void confirmPaidForReservation(@PathVariable String resId) {
        billService.ConfirmedPaidBillsForResId(resId);
    }

    @PostMapping("/api/reservations/{resId}/bills/reservation-rooms/{resRoomId}")
    public void confirmPaidForRoom(@PathVariable String resRoomId) {
        billService.ConfirmedPaidBillsForResRoomId(resRoomId);
    }

    @GetMapping("/api/reservations/{resId}/bills")
    public ReservationBillResponse getReservationBill(@PathVariable String resId) {
        return billService.createReservationBillSummary(resId);
    }

    @GetMapping("/api/reservations/{resId}/bills/reservation-rooms/{resRoomId}")
    public ResRoomBillResponse getRoomBill(@PathVariable String resRoomId) {
        return billService.createResRoomBillSummary(resRoomId);
    }
}

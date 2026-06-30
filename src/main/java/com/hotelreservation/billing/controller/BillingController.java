package com.hotelreservation.billing.controller;

import com.hotelreservation.common.responses.ApiResponse;
import static com.hotelreservation.billing.dto.BillingResponses.*;
import com.hotelreservation.billing.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
public class BillingController {

    @Autowired private BillService billService;

    @PostMapping("/api/reservations/{resId}/bills")
    public ApiResponse<Object> confirmPaidForReservation(@PathVariable("resId") String resId) {
        billService.ConfirmedPaidBillsForResId(resId);
        return ApiResponse.success("Đã xác nhận thanh toán hóa đơn đặt phòng thành công", null);
    }

    @PostMapping("/api/reservations/{resId}/bills/reservation-rooms/{resRoomId}")
    public ApiResponse<Object> confirmPaidForRoom(
            @PathVariable("resId") String resId,
            @PathVariable("resRoomId") String resRoomId) {
        billService.ConfirmedPaidBillsForResRoomId(resRoomId);
        return ApiResponse.success("Đã xác nhận thanh toán hóa đơn phòng thành công", null);
    }

    @GetMapping("/api/reservations/{resId}/bills")
    public ReservationBillResponse getReservationBill(@PathVariable("resId") String resId) {
        return billService.createReservationBillSummary(resId);
    }

    @GetMapping("/api/reservations/{resId}/bills/reservation-rooms/{resRoomId}")
    public ResRoomBillResponse getRoomBill(
            @PathVariable("resId") String resId,
            @PathVariable("resRoomId") String resRoomId) {
        return billService.createResRoomBillSummary(resRoomId);
    }

    @GetMapping("/api/bills/summaries")
    public List<ReservationBillSummaryProjection> getReservationBillSummaries() {
        return billService.getReservationBillSummaries();
    }
}

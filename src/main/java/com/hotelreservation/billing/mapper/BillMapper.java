package com.hotelreservation.billing.mapper;

import com.hotelreservation.billing.dto.BillingResponses.BillResponse;
import com.hotelreservation.billing.entity.Bill;

public class BillMapper {

    public static BillResponse toResponse(Bill bill) {
        if (bill == null) return null;
        BillResponse dto = new BillResponse();
        if (bill.getReservationRoom() != null && bill.getReservationRoom().getRoom() != null) {
            dto.setRoomId(bill.getReservationRoom().getRoom().getId());
        }
        dto.setTotalAmount(bill.getTotalAmount());
        dto.setDate(bill.getCreatedAt());
        if (bill.getReason() != null) {
            dto.setReason(bill.getReason().name());
        }
        if (bill.getStatus() != null) {
            dto.setStatus(bill.getStatus().name());
        }
        return dto;
    }

    private BillMapper() {}
}

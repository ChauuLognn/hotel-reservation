package com.hotelreservation.module.hotelservice.mapper;

import com.hotelreservation.module.hotelservice.dto.response.ReservationServiceResponse;
import com.hotelreservation.module.hotelservice.entity.ReservationService;

public class ReservationServiceMapper {

    public static ReservationServiceResponse toResponse(ReservationService rS) {
        if (rS == null) return null;
        ReservationServiceResponse dto = new ReservationServiceResponse();
        dto.setId(rS.getId());
        if (rS.getReservationRoom() != null && rS.getReservationRoom().getRoom() != null) {
            dto.setRoomId(rS.getReservationRoom().getRoom().getId());
        }
        if (rS.getService() != null) {
            dto.setService(rS.getService().getName());
        }
        dto.setQuantity(rS.getQuantity());
        dto.setTotalAmount(rS.getTotalAmount());
        dto.setUsedAt(rS.getUsedAt());
        if (rS.getCreatedBy() != null) {
            dto.setCreatedBy(rS.getCreatedBy().getId());
        }
        return dto;
    }

    private ReservationServiceMapper() {}
}

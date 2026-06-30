package com.hotelreservation.hotelservice.mapper;

import com.hotelreservation.hotelservice.dto.HotelserviceResponses.HotelServiceResponse;
import com.hotelreservation.hotelservice.dto.HotelserviceResponses.ReservationServiceResponse;
import com.hotelreservation.hotelservice.entity.HotelService;
import com.hotelreservation.hotelservice.entity.UsedService;

public class HotelserviceMapper {

    public static HotelServiceResponse toResponse(HotelService service) {
        if (service == null) {
            return null;
        }
        HotelServiceResponse dto = new HotelServiceResponse();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setPrice(service.getPrice());
        if (service.getStatus() != null) {
            dto.setStatus(service.getStatus().name());
        }
        return dto;
    }

    public static ReservationServiceResponse toResponse(UsedService usedService) {
        if (usedService == null) {
            return null;
        }
        ReservationServiceResponse dto = new ReservationServiceResponse();
        dto.setId(usedService.getId());
        if (usedService.getReservationRoom() != null && usedService.getReservationRoom().getRoom() != null) {
            dto.setRoomId(usedService.getReservationRoom().getRoom().getId());
        }
        if (usedService.getService() != null) {
            dto.setService(usedService.getService().getName());
        }
        dto.setQuantity(usedService.getQuantity());
        dto.setTotalAmount(usedService.getTotalAmount());
        dto.setUsedAt(usedService.getUsedAt());
        if (usedService.getCreatedBy() != null) {
            dto.setCreatedBy(usedService.getCreatedBy().getId());
        }
        return dto;
    }

    private HotelserviceMapper() {}
}

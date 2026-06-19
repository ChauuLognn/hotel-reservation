package com.hotelreservation.module.hotelservice.mapper;

import com.hotelreservation.module.hotelservice.dto.response.HotelServiceResponse;
import com.hotelreservation.module.hotelservice.entity.HotelService;

public class HotelServiceMapper {

    public static HotelServiceResponse toResponse(HotelService service) {
        if (service == null) return null;
        HotelServiceResponse res = new HotelServiceResponse();
        res.setId(service.getId());
        res.setName(service.getName());
        res.setPrice(service.getPrice());
        if (service.getStatus() != null) {
            res.setStatus(service.getStatus().name());
        }
        return res;
    }

    private HotelServiceMapper() {}
}

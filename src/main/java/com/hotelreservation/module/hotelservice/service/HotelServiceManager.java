package com.hotelreservation.module.hotelservice.service;

import com.hotelreservation.module.hotelservice.dto.request.CreateServiceRequest;
import com.hotelreservation.module.hotelservice.dto.request.UpdateServiceRequest;
import com.hotelreservation.module.hotelservice.dto.response.HotelServiceResponse;
import java.util.List;

public interface HotelServiceManager {
    HotelServiceResponse create(CreateServiceRequest rq);
    HotelServiceResponse getByName(String name);
    List<HotelServiceResponse> getAllService();
    HotelServiceResponse update(String name, UpdateServiceRequest rq);
    void delete(String name);
}

package com.hotelreservation.modules.hotelservice.service;

import com.hotelreservation.modules.hotelservice.dto.HotelserviceRequests.CreateServiceRequest;
import com.hotelreservation.modules.hotelservice.dto.HotelserviceRequests.UpdateServiceRequest;
import com.hotelreservation.modules.hotelservice.dto.HotelserviceResponses.HotelServiceResponse;
import java.util.List;

public interface HotelServiceManager {
    HotelServiceResponse create(CreateServiceRequest rq);
    HotelServiceResponse getByName(String name);
    List<HotelServiceResponse> getAllService();
    HotelServiceResponse update(String name, UpdateServiceRequest rq);
    void delete(String name);
}

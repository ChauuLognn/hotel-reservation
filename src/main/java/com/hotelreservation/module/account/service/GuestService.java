package com.hotelreservation.module.account.service;

import com.hotelreservation.module.account.dto.request.GuestCreateRequest;
import com.hotelreservation.module.account.dto.response.GuestResponse;
import java.util.List;

public interface GuestService {
    GuestResponse create(GuestCreateRequest rq);
    List<GuestResponse> getAll();
    GuestResponse getById(Integer id);
    GuestResponse update(Integer id, GuestCreateRequest rq);
    void delete(Integer id);
}
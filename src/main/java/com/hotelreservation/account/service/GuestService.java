package com.hotelreservation.account.service;

import com.hotelreservation.account.dto.AccountRequests.GuestCreateRequest;
import com.hotelreservation.account.dto.AccountResponses.GuestResponse;
import java.util.List;

public interface GuestService {
    GuestResponse create(GuestCreateRequest rq);
    List<GuestResponse> getAll();
    GuestResponse getById(Integer id);
    GuestResponse update(Integer id, GuestCreateRequest rq);
    void delete(Integer id);
}
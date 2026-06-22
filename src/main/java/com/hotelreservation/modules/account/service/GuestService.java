package com.hotelreservation.modules.account.service;

import com.hotelreservation.modules.account.dto.AccountRequests.GuestCreateRequest;
import com.hotelreservation.modules.account.dto.AccountResponses.GuestResponse;
import java.util.List;

public interface GuestService {
    GuestResponse create(GuestCreateRequest rq);
    List<GuestResponse> getAll();
    GuestResponse getById(Integer id);
    GuestResponse update(Integer id, GuestCreateRequest rq);
    void delete(Integer id);
}
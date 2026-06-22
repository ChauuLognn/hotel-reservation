package com.hotelreservation.modules.account.service;

import com.hotelreservation.modules.account.dto.AccountRequests.EmpCreateRequest;
import com.hotelreservation.modules.account.dto.AccountResponses.EmpResponse;
import java.util.List;

public interface EmpService {
    EmpResponse create(EmpCreateRequest rq);
    List<EmpResponse> getAll();
    EmpResponse getById(Integer id);
    EmpResponse update(Integer id, EmpCreateRequest rq);
    void delete(Integer id);
}

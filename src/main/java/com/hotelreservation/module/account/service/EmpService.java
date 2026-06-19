package com.hotelreservation.module.account.service;

import com.hotelreservation.module.account.dto.request.EmpCreateRequest;
import com.hotelreservation.module.account.dto.response.EmpResponse;
import java.util.List;

public interface EmpService {
    EmpResponse create(EmpCreateRequest rq);
    List<EmpResponse> getAll();
    EmpResponse getById(Integer id);
    EmpResponse update(Integer id, EmpCreateRequest rq);
    void delete(Integer id);
}

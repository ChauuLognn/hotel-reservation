package com.hotelreservation.modules.account.service;

import com.hotelreservation.modules.account.dto.AccountRequests.UserCreateRequest;
import com.hotelreservation.modules.account.dto.AccountResponses.UserResponse;
import java.util.List;

public interface UserService {
    UserResponse create(UserCreateRequest rq);
    List<UserResponse> getAll();
    UserResponse getById(Integer id);
    UserResponse update(Integer id, UserCreateRequest rq);
    void delete(Integer id);
}

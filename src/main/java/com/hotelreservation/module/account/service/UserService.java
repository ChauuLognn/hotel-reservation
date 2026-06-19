package com.hotelreservation.module.account.service;

import com.hotelreservation.module.account.dto.request.UserCreateRequest;
import com.hotelreservation.module.account.dto.response.UserResponse;
import java.util.List;

public interface UserService {
    UserResponse create(UserCreateRequest rq);
    List<UserResponse> getAll();
    UserResponse getById(Integer id);
    UserResponse update(Integer id, UserCreateRequest rq);
    void delete(Integer id);
}

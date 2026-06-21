package com.hotelreservation.module.account.mapper;

import com.hotelreservation.module.account.dto.response.UserResponse;
import com.hotelreservation.module.account.entity.User;

public class UserMapper {

    public static UserResponse toResponse(User u) {
        if (u == null) return null;
        UserResponse dto = new UserResponse();
        dto.setId(u.getId());
        dto.setEmpId(u.getEmp() != null ? u.getEmp().getId() : null);
        dto.setGuestId(u.getGuest() != null ? u.getGuest().getId() : null);
        dto.setAccount(u.getAccount());
        dto.setPassword(u.getPassword());
        return dto;
    }

    private UserMapper() {}
}

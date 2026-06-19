package com.hotelreservation.module.account.mapper;

import com.hotelreservation.module.account.dto.response.GuestResponse;
import com.hotelreservation.module.account.entity.Guest;

public class GuestMapper {

    public static GuestResponse toResponse(Guest g) {
        if (g == null) return null;
        GuestResponse dto = new GuestResponse();
        dto.setId(g.getId());
        dto.setFirstName(g.getFirstName());
        dto.setLastName(g.getLastName());
        dto.setIdentityNum(g.getIdentityNum());
        dto.setPhone(g.getPhone());
        dto.setDateOfBirth(g.getDateOfBirth());
        return dto;
    }

    private GuestMapper() {}
}

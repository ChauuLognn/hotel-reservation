package com.hotelreservation.module.account.mapper;

import com.hotelreservation.module.account.dto.response.EmpResponse;
import com.hotelreservation.module.account.entity.Emp;

public class EmpMapper {

    public static EmpResponse toResponse(Emp e) {
        if (e == null) return null;
        EmpResponse dto = new EmpResponse();
        dto.setId(e.getId());
        dto.setFirstName(e.getFirstName());
        dto.setLastName(e.getLastName());
        dto.setDateOfBirth(e.getDateOfBirth());
        dto.setIdentityNum(e.getIdentityNum());
        dto.setEmail(e.getEmail());
        dto.setPhone(e.getPhone());
        dto.setAddress(e.getAddress());
        if (e.getRole() != null) {
            dto.setRole(e.getRole().getName().name());
            dto.setSalary(e.getRole().getSalary());
        }
        return dto;
    }

    private EmpMapper() {}
}

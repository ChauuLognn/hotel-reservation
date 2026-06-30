package com.hotelreservation.account.mapper;

import com.hotelreservation.account.dto.AccountResponses;
import com.hotelreservation.account.entity.Emp;
import com.hotelreservation.account.entity.Guest;
import com.hotelreservation.account.entity.User;

public class AccountMapper {

    public static AccountResponses.EmpResponse toResponse(Emp e) {
        if (e == null) return null;
        AccountResponses.EmpResponse dto = new AccountResponses.EmpResponse();
        dto.setId(e.getId());
        dto.setFirstName(e.getFirstName());
        dto.setLastName(e.getLastName());
        dto.setDateOfBirth(e.getDateOfBirth());
        dto.setIdentityNum(e.getIdentityNum());
        dto.setEmail(e.getEmail());
        dto.setPhone(e.getPhone());
        dto.setAddress(e.getAddress());
        if (e.getRole() != null) {
            dto.setRole(e.getRole().getName() != null ? e.getRole().getName().name() : null);
            dto.setSalary(e.getRole().getSalary());
        }
        return dto;
    }

    public static AccountResponses.GuestResponse toResponse(Guest g) {
        if (g == null) return null;
        AccountResponses.GuestResponse dto = new AccountResponses.GuestResponse();
        dto.setId(g.getId());
        dto.setFirstName(g.getFirstName());
        dto.setLastName(g.getLastName());
        dto.setIdentityNum(g.getIdentityNum());
        dto.setPhone(g.getPhone());
        dto.setDateOfBirth(g.getDateOfBirth());
        return dto;
    }

    public static AccountResponses.UserResponse toResponse(User u) {
        if (u == null) return null;
        AccountResponses.UserResponse dto = new AccountResponses.UserResponse();
        dto.setId(u.getId());
        dto.setEmpId(u.getEmp() != null ? u.getEmp().getId() : null);
        dto.setGuestId(u.getGuest() != null ? u.getGuest().getId() : null);
        dto.setAccount(u.getAccount());
        return dto;
    }

    public static AccountResponses.AdminUserResponse toAdminUserResponse(User u) {
        if (u == null) return null;
        AccountResponses.AdminUserResponse dto = new AccountResponses.AdminUserResponse();
        dto.setId(u.getId());
        dto.setAccount(u.getAccount());
        dto.setEmp(toResponse(u.getEmp()));
        return dto;
    }

    private AccountMapper() {}
}

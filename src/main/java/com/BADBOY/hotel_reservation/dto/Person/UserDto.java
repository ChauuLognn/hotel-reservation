package com.BADBOY.hotel_reservation.dto.Person;

import com.BADBOY.hotel_reservation.entity.User;

// không cần để ý

// thông tin user trả về cho người dùng xem
public class UserDto {
    private Integer id;
    private Integer empId;
    private String account;
    private String password;

    static public UserDto fromEntity(User u){
        UserDto dto = new UserDto();
        dto.setId(u.getId());
        dto.setEmpId(u.getEmp().getId());
        dto.setAccount(u.getAccount());
        dto.setPassword(u.getPassword());
        return dto;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getEmpId() {
        return empId;
    }

    public void setEmpId(Integer empId) {
        this.empId = empId;
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }


}

package com.BADBOY.hotel_reservation.dto.auth;

/**
 * DTO cho request đăng nhập
 */
public class LoginRequest {
    private String account;
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String account, String password) {
        this.account = account;
        this.password = password;
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

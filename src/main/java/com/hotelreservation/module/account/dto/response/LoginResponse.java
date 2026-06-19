package com.hotelreservation.module.account.dto.response;

public class LoginResponse {
    private String token;
    private String tokenType = "Bearer";
    private Integer userId;
    private String account;
    private Integer empId;
    private String empName;
    private String role;
    private Long expiresIn;

    public LoginResponse() {
    }

    public LoginResponse(String token, Integer userId, String account, Integer empId, String empName, String role) {
        this.token = token;
        this.userId = userId;
        this.account = account;
        this.empId = empId;
        this.empName = empName;
        this.role = role;
    }

    public LoginResponse(String token, Integer userId, String account, Integer empId, String empName, String role, Long expiresIn) {
        this.token = token;
        this.userId = userId;
        this.account = account;
        this.empId = empId;
        this.empName = empName;
        this.role = role;
        this.expiresIn = expiresIn;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getAccount() {
        return account;
    }

    public void setAccount(String account) {
        this.account = account;
    }

    public Integer getEmpId() {
        return empId;
    }

    public void setEmpId(Integer empId) {
        this.empId = empId;
    }

    public String getEmpName() {
        return empName;
    }

    public void setEmpName(String empName) {
        this.empName = empName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }
}

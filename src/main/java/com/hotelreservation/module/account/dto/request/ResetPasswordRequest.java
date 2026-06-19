package com.hotelreservation.module.account.dto.request;

public class ResetPasswordRequest {
    private String account;
    private String identityNum;
    private String newPassword;

    public ResetPasswordRequest() {}

    public ResetPasswordRequest(String account, String identityNum, String newPassword) {
        this.account = account;
        this.identityNum = identityNum;
        this.newPassword = newPassword;
    }

    public String getAccount() { return account; }
    public void setAccount(String account) { this.account = account; }

    public String getIdentityNum() { return identityNum; }
    public void setIdentityNum(String identityNum) { this.identityNum = identityNum; }

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}

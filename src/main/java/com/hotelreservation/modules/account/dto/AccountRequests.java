package com.hotelreservation.modules.account.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.*;

public class AccountRequests {

    public static class AdminCreateUserRequest {
        @NotBlank(message = "Account khong duoc de trong")
        private String account;

        @Size(min = 6, message = "Password phai co it nhat 6 ky tu")
        private String password;

        @NotBlank(message = "Ho ten khong duoc de trong")
        private String fullName;

        @NotBlank(message = "Email khong duoc de trong")
        @Email(message = "Email khong dung dinh dang")
        private String email;

        @NotBlank(message = "So dien thoai khong duoc de trong")
        private String phone;
        private String address;

        @NotBlank(message = "CMND/CCCD khong duoc de trong")
        @Size(min = 9, max = 12, message = "CMND/CCCD phai tu 9 den 12 so")
        private String identityNum;

        @NotBlank(message = "Vai tro khong duoc de trong")
        private String roleName;

        public AdminCreateUserRequest() {}

        public AdminCreateUserRequest(String account, String password, String fullName, String email, 
                                     String phone, String address, String identityNum, String roleName) {
            this.account = account;
            this.password = password;
            this.fullName = fullName;
            this.email = email;
            this.phone = phone;
            this.address = address;
            this.identityNum = identityNum;
            this.roleName = roleName;
        }

        public String getAccount() { return account; }
        public void setAccount(String account) { this.account = account; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getIdentityNum() { return identityNum; }
        public void setIdentityNum(String identityNum) { this.identityNum = identityNum; }

        public String getRoleName() { return roleName; }
        public void setRoleName(String roleName) { this.roleName = roleName; }
    }

    public static class ChangePasswordRequest {
        @NotBlank(message = "Mat khau cu khong duoc de trong")
        private String oldPassword;

        @NotBlank(message = "Mat khau moi khong duoc de trong")
        @Size(min = 6, message = "Mat khau moi phai co it nhat 6 ky tu")
        private String newPassword;

        public ChangePasswordRequest() {}

        public ChangePasswordRequest(String oldPassword, String newPassword) {
            this.oldPassword = oldPassword;
            this.newPassword = newPassword;
        }

        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class EmpCreateRequest {
        @NotBlank(message = "Họ không được để trống")
        private String firstName;

        @NotBlank(message = "Tên không được để trống")
        private String lastName;

        @NotNull(message = "Ngày sinh không được để trống")
        private LocalDate dateOfBirth;

        @NotBlank(message = "Số CMND/CCCD không được để trống")
        @Size(min = 9, max = 12, message = "CMND/CCCD phải từ 9 đến 12 số")
        private String identityNum;

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        private String email;

        @NotBlank(message = "Số điện thoại không được để trống")
        private String phone;

        private String address;

        @NotNull(message = "Mã vai trò không được để trống")
        private Integer role;
        private String roleName;

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public LocalDate getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

        public String getIdentityNum() { return identityNum; }
        public void setIdentityNum(String identityNum) { this.identityNum = identityNum; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public Integer getRole() { return role; }
        public void setRole(Integer role) { this.role = role; }
        public String getRoleName() { return roleName; }
        public void setRoleName(String roleName) { this.roleName = roleName; }
    }

    public static class GuestCreateRequest {
        @NotBlank(message = "Họ không được để trống")
        private String firstName;

        @NotBlank(message = "Tên không được để trống")
        private String lastName;

        @NotBlank(message = "Số CMND/CCCD không được để trống")
        @Size(min = 9, max = 12, message = "CMND/CCCD phải từ 9 đến 12 số")
        private String identityNum;

        @NotBlank(message = "Số điện thoại không được để trống")
        private String phone;

        private LocalDate dateOfBirth;

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getIdentityNum() { return identityNum; }
        public void setIdentityNum(String identityNum) { this.identityNum = identityNum; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public LocalDate getDateOfBirth() { return dateOfBirth; }
        public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Account khong duoc de trong")
        private String account;

        @NotBlank(message = "Password khong duoc de trong")
        private String password;

        public LoginRequest() {}

        public LoginRequest(String account, String password) {
            this.account = account;
            this.password = password;
        }

        public String getAccount() { return account; }
        public void setAccount(String account) { this.account = account; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Account khong duoc de trong")
        private String account;

        @NotBlank(message = "Password khong duoc de trong")
        @Size(min = 6, message = "Password phai co it nhat 6 ky tu")
        private String password;

        @NotBlank(message = "Ho ten khong duoc de trong")
        private String fullName;

        @NotBlank(message = "Email khong duoc de trong")
        @Email(message = "Email khong dung dinh dang")
        private String email;

        @NotBlank(message = "So dien thoai khong duoc de trong")
        private String phone;
        private String address;

        @NotBlank(message = "CMND/CCCD khong duoc de trong")
        @Size(min = 9, max = 12, message = "CMND/CCCD phai tu 9 den 12 so")
        private String identityNum;

        public RegisterRequest() {}

        public RegisterRequest(String account, String password, String fullName, String email, 
                               String phone, String address, String identityNum) {
            this.account = account;
            this.password = password;
            this.fullName = fullName;
            this.email = email;
            this.phone = phone;
            this.address = address;
            this.identityNum = identityNum;
        }

        public String getAccount() { return account; }
        public void setAccount(String account) { this.account = account; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getIdentityNum() { return identityNum; }
        public void setIdentityNum(String identityNum) { this.identityNum = identityNum; }
    }

    public static class ResetPasswordRequest {
        @NotBlank(message = "Account khong duoc de trong")
        private String account;

        @NotBlank(message = "CMND/CCCD khong duoc de trong")
        private String identityNum;

        @NotBlank(message = "Mat khau moi khong duoc de trong")
        @Size(min = 6, message = "Mat khau moi phai co it nhat 6 ky tu")
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

    public static class UserCreateRequest {
        private Integer empId;
        private String account;
        private String password;

        public Integer getEmpId() { return empId; }
        public void setEmpId(Integer empId) { this.empId = empId; }

        public String getAccount() { return account; }
        public void setAccount(String account) { this.account = account; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AdminResetPasswordRequest {
        @NotBlank(message = "Mat khau moi khong duoc de trong")
        @Size(min = 6, message = "Mat khau moi phai co it nhat 6 ky tu")
        private String newPassword;

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}

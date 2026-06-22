package com.hotelreservation.modules.account.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class AccountResponses {

    public static class EmpResponse {
        private Integer id;
        private String firstName;
        private String lastName;
        private LocalDate dateOfBirth;
        private String identityNum;
        private String email;
        private String phone;
        private String address;
        private String role;
        private BigDecimal salary;

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }

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

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public BigDecimal getSalary() { return salary; }
        public void setSalary(BigDecimal salary) { this.salary = salary; }
    }

    public static class GuestResponse {
        private Integer id;
        private String firstName;
        private String lastName;
        private String identityNum;
        private String phone;
        private LocalDate dateOfBirth;

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }

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

    public static class LoginResponse {
        private String token;
        private String tokenType = "Bearer";
        private Integer userId;
        private String account;
        private Integer empId;
        private String empName;
        private String role;
        private Long expiresIn;
        private Integer guestId;
        private UserInfo user;

        public LoginResponse() {}

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

        public LoginResponse(String token, Integer userId, String account, Integer empId, String empName, String role, Long expiresIn, Integer guestId) {
            this.token = token;
            this.userId = userId;
            this.account = account;
            this.empId = empId;
            this.empName = empName;
            this.role = role;
            this.expiresIn = expiresIn;
            this.guestId = guestId;
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public String getTokenType() { return tokenType; }
        public void setTokenType(String tokenType) { this.tokenType = tokenType; }

        public Integer getUserId() { return userId; }
        public void setUserId(Integer userId) { this.userId = userId; }

        public String getAccount() { return account; }
        public void setAccount(String account) { this.account = account; }

        public Integer getEmpId() { return empId; }
        public void setEmpId(Integer empId) { this.empId = empId; }

        public String getEmpName() { return empName; }
        public void setEmpName(String empName) { this.empName = empName; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public Long getExpiresIn() { return expiresIn; }
        public void setExpiresIn(Long expiresIn) { this.expiresIn = expiresIn; }

        public Integer getGuestId() { return guestId; }
        public void setGuestId(Integer guestId) { this.guestId = guestId; }

        public UserInfo getUser() { return user; }
        public void setUser(UserInfo user) { this.user = user; }

        public static class UserInfo {
            private Integer id;
            private String email;
            private String role;

            public UserInfo() {}
            public UserInfo(Integer id, String email, String role) {
                this.id = id;
                this.email = email;
                this.role = role;
            }

            public Integer getId() { return id; }
            public void setId(Integer id) { this.id = id; }

            public String getEmail() { return email; }
            public void setEmail(String email) { this.email = email; }

            public String getRole() { return role; }
            public void setRole(String role) { this.role = role; }
        }
    }

    public static class UserResponse {
        private Integer id;
        private Integer empId;
        private Integer guestId;
        private String account;

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }

        public Integer getEmpId() { return empId; }
        public void setEmpId(Integer empId) { this.empId = empId; }

        public Integer getGuestId() { return guestId; }
        public void setGuestId(Integer guestId) { this.guestId = guestId; }

        public String getAccount() { return account; }
        public void setAccount(String account) { this.account = account; }

    }

    public static class AdminUserResponse {
        private Integer id;
        private String account;
        private EmpResponse emp;

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }

        public String getAccount() { return account; }
        public void setAccount(String account) { this.account = account; }

        public EmpResponse getEmp() { return emp; }
        public void setEmp(EmpResponse emp) { this.emp = emp; }
    }
}

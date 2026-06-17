package modules.account.dto;



public class AuthPayload {

    public static class LoginRequest {
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

    public static class LoginResponse {
        private String token;
        private String tokenType = "Bearer";
        private Integer userId;
        private String account;
        private Integer empId;
        private String empName;
        private String role;
        private Long expiresIn;  // Thời gian hết hạn (milliseconds)

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

        // Getters and Setters
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

    public static class RegisterRequest {
        private String account;      // Username
        private String password;     // Password gốc (sẽ được hash tự động)
        private String fullName;     // Tên đầy đủ
        private String email;        // Email
        private String phone;        // Số điện thoại
        private String address;      // Địa chỉ
        private String identityNum;  // CCCD/CMND (identityNum trong database)

        // Constructors
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

        // Getters and Setters
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
}

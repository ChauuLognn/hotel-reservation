package modules.account.dto;

import modules.account.entity.User;

public class UserPayload {

    public static class UserCreationRequest {
        private Integer empId;
        private String account;
        private String password;

        public int getEmpId() {
            return empId;
        }

        public void setEmpId(int empId) {
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

    public static class UserDto {
        private Integer id;
        private Integer empId;
        private String account;
        private String password;

        static public UserDto fromEntity(User u){
            UserDto dto = new UserDto();
            dto.setId(u.getId());
            dto.setEmpId(u.getEmp() != null ? u.getEmp().getId() : null);
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

    public static class ChangePasswordRequest {
        private String oldPassword;  // Password cũ (để xác thực)
        private String newPassword;  // Password mới

        // Constructors
        public ChangePasswordRequest() {}

        public ChangePasswordRequest(String oldPassword, String newPassword) {
            this.oldPassword = oldPassword;
            this.newPassword = newPassword;
        }

        // Getters and Setters
        public String getOldPassword() { return oldPassword; }
        public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class CreateUserRequest {
        private String account;      // Username
        private String password;     // Password gốc (sẽ được hash tự động)
        private String fullName;     // Tên đầy đủ
        private String email;        // Email
        private String phone;        // Số điện thoại
        private String address;      // Địa chỉ
        private String identityNum;  // CCCD/CMND (identityNum trong database)
        private String roleName;     // "MANAGER" hoặc "EMPLOYEE"

        // Constructors
        public CreateUserRequest() {}

        public CreateUserRequest(String account, String password, String fullName, String email, 
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

        public String getRoleName() { return roleName; }
        public void setRoleName(String roleName) { this.roleName = roleName; }
    }
}

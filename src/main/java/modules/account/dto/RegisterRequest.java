package modules.account.dto;

/**
 * Request DTO cho đăng ký user mới
 */
public class RegisterRequest {
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
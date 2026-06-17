package modules.account.dto;

/**
 * Request DTO cho đổi password
 */
public class ChangePasswordRequest {
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
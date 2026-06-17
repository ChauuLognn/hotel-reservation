package modules.account.controller;
import modules.account.service.CustomUserDetailsService;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import common.payload.ApiResponse;
import modules.account.dto.ChangePasswordRequest;
import modules.account.dto.LoginRequest;
import modules.account.dto.LoginResponse;
import modules.account.dto.RegisterRequest;
import modules.account.entity.Emp;
import modules.account.entity.User;
import common.enums.RoleName;
import modules.account.entity.Role;
import modules.account.repository.EmpRepository;
import modules.account.repository.UserRepository;
import modules.account.repository.RoleRepository;
import security.JwtUtil;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Authentication Controller với JWT
 * 
 * Xử lý đăng nhập với JWT (JSON Web Token)
 * 
 * Flow:
 * 1. Client gửi account + password
 * 2. AuthenticationManager verify password (BCrypt)
 * 3. Nếu OK → Generate JWT token
 * 4. Trả về token cho client
 * 5. Client gửi token trong header "Authorization: Bearer <token>"
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmpRepository empRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * API Đăng nhập với JWT
     * 
     * POST /api/auth/login
     * Body: { "account": "admin", "password": "123456" }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Login successful",
     *   "data": {
     *     "token": "eyJhbGciOiJIUzI1NiJ9...",  // JWT token
     *     "tokenType": "Bearer",
     *     "userId": 1,
     *     "account": "admin",
     *     "empId": 9,
     *     "empName": "Nguyen Van A",
     *     "role": "RECEPTIONIST",
     *     "expiresIn": 86400000  // 24 hours in milliseconds
     *   }
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        try {
            // 1. AUTHENTICATE với Spring Security
            // AuthenticationManager tự động:
            //    - Load user từ CustomUserDetailsService
            //    - Compare password với BCrypt
            //    - Throw exception nếu sai
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getAccount(),
                    request.getPassword()
                )
            );

            // 2. Nếu authentication thành công, lấy thông tin user
            String account = authentication.getName();
            User user = userRepository.findByAccount(account)
                    .orElseThrow(() -> new IllegalStateException("User not found after authentication"));

            // 3. GENERATE JWT TOKEN
            String jwtToken = jwtUtil.generateToken(account);

            // 4. Lấy thông tin employee
            Emp emp = user.getEmp();
            if (emp == null) {
                throw new IllegalStateException("User is not associated with any employee");
            }

            // 5. Tạo response với JWT
            LoginResponse loginResponse = new LoginResponse(
                jwtToken,                                   // JWT token
                user.getId(),
                user.getAccount(),
                emp.getId(),
                emp.getFirstName() + " " + emp.getLastName(),
                emp.getRole().getName().name(),
                jwtUtil.getExpirationTime()                // Expiration time (24h)
            );

            return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));

        } catch (AuthenticationException e) {
            // Authentication failed (wrong password or user not found)
            throw new IllegalArgumentException("Invalid account or password");
        }
    }

    /**
     * API Logout
     * 
     * Với JWT, logout chỉ cần:
     * 1. Client xóa token khỏi localStorage
     * 2. (Optional) Thêm token vào blacklist nếu muốn revoke ngay
     * 
     * Hiện tại: Client-side logout (đơn giản)
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful. Please remove token from client.", null));
    }

    /**
     * API Đăng ký User/Employee mới
     * 
     * POST /api/auth/register
     * Body: {
     *   "account": "newuser",
     *   "password": "mypassword123",  // Password gốc - sẽ tự động hash
     *   "fullName": "Nguyen Van A",
     *   "email": "user@example.com",
     *   "phone": "0123456789",
     *   "address": "123 ABC Street",
     *   "identityNum": "001234567890"
     * }
     * 
     * ✅ Password sẽ TỰ ĐỘNG được hash bằng BCrypt trước khi lưu vào database
     * ✅ Khách hàng nhập password GỐC, backend tự động mã hóa
     * ✅ Mặc định tạo role EMPLOYEE (staff thường)
     * 
     * PUBLIC endpoint - Không cần JWT token
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody RegisterRequest request) {
        try {
            // 1. Kiểm tra account đã tồn tại chưa
            if (userRepository.findByAccount(request.getAccount()).isPresent()) {
                throw new IllegalArgumentException("Account already exists");
            }

            // 2. Kiểm tra email, phone, identityNum đã tồn tại chưa
            if (empRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already exists");
            }
            if (empRepository.findByPhone(request.getPhone()).isPresent()) {
                throw new IllegalArgumentException("Phone already exists");
            }
            if (empRepository.findByIdentityNum(request.getIdentityNum()).isPresent()) {
                throw new IllegalArgumentException("Identity number already exists");
            }

            // 3. Tạo Employee mới
            Emp emp = new Emp();
            String[] nameParts = request.getFullName().split(" ", 2);
            emp.setFirstName(nameParts[0]);
            emp.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            emp.setEmail(request.getEmail());
            emp.setPhone(request.getPhone());
            emp.setAddress(request.getAddress());
            emp.setIdentityNum(request.getIdentityNum());
            
            // Load default role EMPLOYEE từ database
            Role employeeRole = roleRepository.findByName(RoleName.EMPLOYEE)
                .orElseThrow(() -> new IllegalStateException("EMPLOYEE role not found in database"));
            emp.setRole(employeeRole);
            
            emp = empRepository.save(emp);

            // 4. Tạo User với password đã hash
            User user = new User();
            user.setAccount(request.getAccount());
            user.setPassword(passwordEncoder.encode(request.getPassword()));  // Auto hash với BCrypt
            user.setEmp(emp);
            user = userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("User registered successfully", user));

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to register user: " + e.getMessage());
        }
    }

    /**
     * API Đổi Password
     * 
     * POST /api/auth/change-password
     * Header: Authorization: Bearer <token>
     * Body: {
     *   "oldPassword": "123456",      // Password cũ để xác thực
     *   "newPassword": "newpass456"   // Password mới - sẽ tự động hash
     * }
     * 
     * ✅ Cần gửi kèm JWT token trong header
     * ✅ Verify oldPassword trước khi đổi
     * ✅ newPassword tự động được hash bằng BCrypt
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Object>> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            // 1. Lấy username từ JWT token (đã authenticated)
            String account = SecurityContextHolder.getContext().getAuthentication().getName();
            
            User user = userRepository.findByAccount(account)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            // 2. Verify old password
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Old password is incorrect");
            }

            // 3. Hash new password và update
            String hashedNewPassword = passwordEncoder.encode(request.getNewPassword());
            user.setPassword(hashedNewPassword);
            userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to change password: " + e.getMessage());
        }
    }
}

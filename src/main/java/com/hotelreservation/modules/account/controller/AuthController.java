package com.hotelreservation.modules.account.controller;

import java.util.Optional;
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

import com.hotelreservation.common.responses.ApiResponse;
import static com.hotelreservation.modules.account.dto.AccountRequests.*;
import static com.hotelreservation.modules.account.dto.AccountResponses.*;
import com.hotelreservation.modules.account.entity.Emp;
import com.hotelreservation.modules.account.entity.User;
import com.hotelreservation.common.enums.RoleName;
import com.hotelreservation.modules.account.entity.Role;
import com.hotelreservation.modules.account.repository.EmpRepository;
import com.hotelreservation.modules.account.repository.UserRepository;
import com.hotelreservation.modules.account.repository.RoleRepository;
import com.hotelreservation.modules.account.repository.GuestRepository;
import com.hotelreservation.modules.account.entity.Guest;
import com.hotelreservation.security.jwt.JwtTokenProvider;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.servlet.http.HttpServletRequest;
import com.hotelreservation.security.service.RateLimiterService;

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
    private JwtTokenProvider JwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmpRepository empRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RateLimiterService rateLimiterService;

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
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        String ip = servletRequest.getRemoteAddr();
        String account = request.getAccount();
        if (rateLimiterService.isBlocked("ip:" + ip) || rateLimiterService.isBlocked("account:" + account)) {
            throw new IllegalStateException("Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 1 phút.");
        }
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
            account = authentication.getName();
            User user = userRepository.findByAccount(account)
                    .orElseThrow(() -> new IllegalStateException("User not found after authentication"));

            // 3. GENERATE JWT TOKEN
            String jwtToken = JwtTokenProvider.generateToken(account);

            // 4. Lấy thông tin employee
            Emp emp = user.getEmp();
            Integer empId = null;
            String empName = "";
            String role = "CUSTOMER";
            if (emp != null) {
                empId = emp.getId();
                empName = emp.getFirstName() + " " + emp.getLastName();
                if (emp.getRole() != null) {
                    role = emp.getRole().getName().name();
                }
            }

            Integer guestId = user.getGuest() != null ? user.getGuest().getId() : null;

            // 5. Tạo response với JWT
            LoginResponse loginResponse = new LoginResponse(
                jwtToken,                                   // JWT token
                user.getId(),
                user.getAccount(),
                empId,
                empName,
                role,
                JwtTokenProvider.getExpirationTime(),                // Expiration time (24h)
                guestId
            );

            rateLimiterService.reset("ip:" + ip);
            rateLimiterService.reset("account:" + account);

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
    public ResponseEntity<ApiResponse<User>> register(@RequestBody RegisterRequest request, HttpServletRequest servletRequest) {
        String ip = servletRequest.getRemoteAddr();
        if (rateLimiterService.isBlocked("ip:" + ip) || rateLimiterService.isBlocked("register:" + request.getAccount())) {
            throw new IllegalStateException("Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 1 phút.");
        }
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
            
            // Load default role CUSTOMER từ database
            Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new IllegalStateException("CUSTOMER role not found in database"));
            emp.setRole(customerRole);
            
            emp = empRepository.save(emp);

            // Link/create Guest Profile
            Guest guest = null;
            Optional<Guest> existingGuestOpt = guestRepository.findGuestByPhone(request.getPhone());
            if (existingGuestOpt.isEmpty()) {
                existingGuestOpt = guestRepository.findGuestByIdentityNum(request.getIdentityNum());
            }
            if (existingGuestOpt.isPresent()) {
                guest = existingGuestOpt.get();
            } else {
                guest = new Guest();
                guest.setFirstName(nameParts[0]);
                guest.setLastName(nameParts.length > 1 ? nameParts[1] : "");
                guest.setPhone(request.getPhone());
                guest.setIdentityNum(request.getIdentityNum());
                guest = guestRepository.save(guest);
            }

            // 4. Tạo User với password đã hash
            User user = new User();
            user.setAccount(request.getAccount());
            user.setPassword(passwordEncoder.encode(request.getPassword()));  // Auto hash với BCrypt
            user.setEmp(emp);
            user.setGuest(guest);
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

    /**
     * API Reset Password
     * 
     * POST /api/auth/reset-password
     * Body: {
     *   "account": "admin",
     *   "identityNum": "11111",
     *   "newPassword": "newpassword123"
     * }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            User user = userRepository.findByAccount(request.getAccount())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));

            Emp emp = user.getEmp();
            if (emp == null || !emp.getIdentityNum().equals(request.getIdentityNum())) {
                throw new IllegalArgumentException("Identity number does not match");
            }

            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to reset password: " + e.getMessage());
        }
    }

    /**
     * API Làm mới JWT token trước khi hết hạn
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(HttpServletRequest servletRequest) {
        String authHeader = servletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String account = JwtTokenProvider.extractUsername(token);
        if (!JwtTokenProvider.validateToken(token, account)) {
            throw new IllegalArgumentException("Invalid token to refresh");
        }
        
        String newToken = JwtTokenProvider.generateToken(account);
        User user = userRepository.findByAccount(account)
                .orElseThrow(() -> new IllegalStateException("User not found after token refresh"));

        Emp emp = user.getEmp();
        Integer empId = null;
        String empName = "";
        String role = "CUSTOMER";
        if (emp != null) {
            empId = emp.getId();
            empName = emp.getFirstName() + " " + emp.getLastName();
            if (emp.getRole() != null) {
                role = emp.getRole().getName().name();
            }
        }

        LoginResponse loginResponse = new LoginResponse(
            newToken,
            user.getId(),
            user.getAccount(),
            empId,
            empName,
            role,
            JwtTokenProvider.getExpirationTime(),
            user.getGuest() != null ? user.getGuest().getId() : null
        );

        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", loginResponse));
    }
}

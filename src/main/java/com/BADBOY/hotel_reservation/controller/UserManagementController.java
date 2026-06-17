package com.BADBOY.hotel_reservation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.BADBOY.hotel_reservation.dto.ApiResponse;
import com.BADBOY.hotel_reservation.dto.auth.CreateUserRequest;
import com.BADBOY.hotel_reservation.entity.Emp;
import com.BADBOY.hotel_reservation.entity.Role;
import com.BADBOY.hotel_reservation.entity.User;
import com.BADBOY.hotel_reservation.entity.Enum.RoleName;
import com.BADBOY.hotel_reservation.repository.Person.EmpRepository;
import com.BADBOY.hotel_reservation.repository.Person.UserRepository;
import com.BADBOY.hotel_reservation.repository.RoleRepository;

import java.util.List;

/**
 * User Management Controller
 * 
 * Quản lý users (chỉ dành cho Admin)
 * 
 * PROTECTED endpoints - Cần JWT token
 */
@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmpRepository empRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * API Tạo User mới (Admin only)
     * 
     * POST /api/users
     * Header: Authorization: Bearer <token>
     * Body: {
     *   "account": "newmanager",
     *   "password": "password123",
     *   "fullName": "Tran Van B",
     *   "email": "manager@example.com",
     *   "phone": "0912345678",
     *   "address": "789 XYZ Street",
     *   "identityNum": "012345678901",
     *   "roleName": "MANAGER"  // "MANAGER" hoặc "EMPLOYEE"
     * }
     * 
     * ✅ Admin có thể chọn role cho user mới
     * ✅ Password tự động hash
     */
    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody CreateUserRequest request) {
        try {
            // 1. Validate
            if (userRepository.findByAccount(request.getAccount()).isPresent()) {
                throw new IllegalArgumentException("Account already exists");
            }
            if (empRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already exists");
            }
            if (empRepository.findByPhone(request.getPhone()).isPresent()) {
                throw new IllegalArgumentException("Phone already exists");
            }
            if (empRepository.findByIdentityNum(request.getIdentityNum()).isPresent()) {
                throw new IllegalArgumentException("Identity number already exists");
            }

            // 2. Parse role name
            RoleName roleName;
            try {
                roleName = RoleName.valueOf(request.getRoleName().toUpperCase());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid role name. Use MANAGER or EMPLOYEE");
            }

            // 3. Tạo Employee
            Emp emp = new Emp();
            String[] nameParts = request.getFullName().split(" ", 2);
            emp.setFirstName(nameParts[0]);
            emp.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            emp.setEmail(request.getEmail());
            emp.setPhone(request.getPhone());
            emp.setAddress(request.getAddress());
            emp.setIdentityNum(request.getIdentityNum());
            
            // Load role từ database
            Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException(roleName + " role not found in database"));
            emp.setRole(role);
            
            emp = empRepository.save(emp);

            // 4. Tạo User với password đã hash
            User user = new User();
            user.setAccount(request.getAccount());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setEmp(emp);
            user = userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("User created successfully", user));

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user: " + e.getMessage());
        }
    }

    /**
     * API Lấy danh sách tất cả users
     * 
     * GET /api/users
     * Header: Authorization: Bearer <token>
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    /**
     * API Lấy thông tin user theo ID
     * 
     * GET /api/users/{id}
     * Header: Authorization: Bearer <token>
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Integer id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    /**
     * API Cập nhật thông tin user
     * 
     * PUT /api/admin/users/{id}
     * Header: Authorization: Bearer <token>
     * Body: {
     *   "fullName": "Nguyen Van C",
     *   "email": "newmail@example.com",
     *   "phone": "0987654321",
     *   "address": "New Address",
     *   "identityNum": "123456789012",
     *   "roleName": "MANAGER"
     * }
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Integer id,
            @RequestBody CreateUserRequest request) {
        try {
            User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            Emp emp = user.getEmp();
            
            // Update employee info
            if (request.getFullName() != null) {
                String[] nameParts = request.getFullName().split(" ", 2);
                emp.setFirstName(nameParts[0]);
                emp.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            }
            if (request.getEmail() != null) {
                emp.setEmail(request.getEmail());
            }
            if (request.getPhone() != null) {
                emp.setPhone(request.getPhone());
            }
            if (request.getAddress() != null) {
                emp.setAddress(request.getAddress());
            }
            if (request.getIdentityNum() != null) {
                emp.setIdentityNum(request.getIdentityNum());
            }
            if (request.getRoleName() != null) {
                RoleName roleName = RoleName.valueOf(request.getRoleName().toUpperCase());
                Role role = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new IllegalStateException(roleName + " role not found"));
                emp.setRole(role);
            }
            
            empRepository.save(emp);
            
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
            
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update user: " + e.getMessage());
        }
    }

    /**
     * API Xóa user
     * 
     * DELETE /api/users/{id}
     * Header: Authorization: Bearer <token>
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteUser(@PathVariable Integer id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    /**
     * API Reset password cho user (Admin only)
     * 
     * PUT /api/users/{id}/reset-password
     * Header: Authorization: Bearer <token>
     * Body: {
     *   "newPassword": "newpassword123"
     * }
     * 
     * ✅ Admin có thể reset password cho bất kỳ user nào
     * ✅ Password tự động hash
     */
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(
            @PathVariable Integer id,
            @RequestBody ResetPasswordRequest request) {
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    /**
     * Inner class for reset password request
     */
    public static class ResetPasswordRequest {
        private String newPassword;

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}

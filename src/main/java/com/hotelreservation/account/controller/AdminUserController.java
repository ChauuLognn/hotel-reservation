package com.hotelreservation.account.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import com.hotelreservation.common.responses.ApiResponse;
import com.hotelreservation.common.enums.RoleName;
import static com.hotelreservation.account.dto.AccountRequests.*;
import com.hotelreservation.account.dto.AccountResponses.AdminUserResponse;
import com.hotelreservation.account.entity.Emp;
import com.hotelreservation.account.entity.User;
import com.hotelreservation.account.entity.Role;
import com.hotelreservation.account.mapper.AccountMapper;
import com.hotelreservation.account.repository.EmpRepository;
import com.hotelreservation.account.repository.UserRepository;
import com.hotelreservation.account.repository.RoleRepository;
import com.hotelreservation.account.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired private UserService userDomain;
    @Autowired private UserRepository userRepository;
    @Autowired private EmpRepository empRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional
    public ResponseEntity<ApiResponse<AdminUserResponse>> createAdminUser(@RequestBody @Valid AdminCreateUserRequest request) {
        try {
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                throw new IllegalArgumentException("Password is required");
            }
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

            RoleName roleName;
            try {
                roleName = RoleName.valueOf(request.getRoleName().toUpperCase());
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid role name. Use MANAGER or EMPLOYEE");
            }

            Emp emp = new Emp();
            String[] nameParts = request.getFullName().split(" ", 2);
            emp.setFirstName(nameParts[0]);
            emp.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            emp.setEmail(request.getEmail());
            emp.setPhone(request.getPhone());
            emp.setAddress(request.getAddress());
            emp.setIdentityNum(request.getIdentityNum());
            
            Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException(roleName + " role not found in database"));
            emp.setRole(role);
            
            emp = empRepository.save(emp);

            User user = new User();
            user.setAccount(request.getAccount());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setEmp(emp);
            user = userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("User created successfully", AccountMapper.toAdminUserResponse(user)));

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user: " + e.getMessage());
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllAdminUsers() {
        List<User> users = userRepository.findAll();
        List<AdminUserResponse> response = users.stream()
            .map(AccountMapper::toAdminUserResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getAdminUserById(@PathVariable Integer id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", AccountMapper.toAdminUserResponse(user)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateAdminUser(
            @PathVariable Integer id,
            @RequestBody @Valid AdminCreateUserRequest request) {
        try {
            User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
            if ("system".equals(user.getAccount())) {
                throw new IllegalArgumentException("Không thể cập nhật thông tin tài khoản hệ thống 'system'.");
            }
            
            Emp emp = user.getEmp();
            
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
            
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", AccountMapper.toAdminUserResponse(user)));
            
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Object>> deleteAdminUser(@PathVariable Integer id) {
        userDomain.delete(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Object>> resetPassword(
            @PathVariable Integer id,
            @RequestBody @Valid AdminResetPasswordRequest request) {
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if ("system".equals(user.getAccount())) {
            throw new IllegalArgumentException("Không thể đặt lại mật khẩu cho tài khoản hệ thống 'system'.");
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName().equals(user.getAccount())) {
            throw new IllegalArgumentException("Không thể tự đặt lại mật khẩu của chính mình tại đây. Vui lòng dùng chức năng Đổi mật khẩu.");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }
}

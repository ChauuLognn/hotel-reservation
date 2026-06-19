package com.hotelreservation.module.account.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import com.hotelreservation.common.payload.ApiResponse;
import com.hotelreservation.module.account.dto.request.EmpCreateRequest;
import com.hotelreservation.module.account.dto.response.EmpResponse;
import com.hotelreservation.module.account.dto.request.GuestCreateRequest;
import com.hotelreservation.module.account.dto.response.GuestResponse;
import com.hotelreservation.module.account.dto.request.UserCreateRequest;
import com.hotelreservation.module.account.dto.response.UserResponse;
import com.hotelreservation.module.account.dto.request.AdminCreateUserRequest;
import com.hotelreservation.module.reservation.dto.response.GuestStayResponse;

import com.hotelreservation.module.account.service.EmpService;
import com.hotelreservation.module.account.service.GuestService;
import com.hotelreservation.module.account.service.UserService;
import com.hotelreservation.module.reservation.service.ReservationService;

import com.hotelreservation.module.account.entity.Emp;
import com.hotelreservation.module.account.entity.User;
import com.hotelreservation.module.account.entity.Role;
import com.hotelreservation.common.enums.RoleName;

import com.hotelreservation.module.account.repository.EmpRepository;
import com.hotelreservation.module.account.repository.UserRepository;
import com.hotelreservation.module.account.repository.RoleRepository;

import java.util.List;

@RestController
@SuppressWarnings("null")
public class UserController {

    @Autowired private EmpService eDomain;
    @Autowired private GuestService gDomain;
    @Autowired private UserService userDomain;
    @Autowired private ReservationService resDomain;

    @Autowired private UserRepository userRepository;
    @Autowired private EmpRepository empRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    // ─── Employee Endpoints (from PersonController) ───────────────────────────

    @PostMapping("/api/emps")
    public EmpResponse createEmp(@RequestBody EmpCreateRequest rq) {
        return eDomain.create(rq);
    }

    @GetMapping("/api/emps")
    public List<EmpResponse> getAllEmps() {
        return eDomain.getAll();
    }

    @GetMapping("/api/emps/{id}")
    public EmpResponse getEmpById(@PathVariable Integer id) {
        return eDomain.getById(id);
    }

    @PutMapping("/api/emps/{id}")
    public EmpResponse updateEmp(@PathVariable Integer id, @RequestBody EmpCreateRequest rq) {
        return eDomain.update(id, rq);
    }

    @DeleteMapping("/api/emps/{id}")
    public String deleteEmp(@PathVariable Integer id) {
        eDomain.delete(id);
        return "Deleted emp successfully";
    }

    // ─── Guest Endpoints (from PersonController) ──────────────────────────────

    @PostMapping("/api/guests")
    public GuestResponse createGuest(@RequestBody GuestCreateRequest rq) {
        return gDomain.create(rq);
    }

    @GetMapping("/api/guests")
    public List<GuestResponse> getAllGuests() {
        return gDomain.getAll();
    }

    @GetMapping("/api/guests/{id}")
    public GuestResponse getGuestById(@PathVariable Integer id) {
        return gDomain.getById(id);
    }

    @PutMapping("/api/guests/{id}")
    public GuestResponse updateGuest(@PathVariable Integer id, @RequestBody GuestCreateRequest rq) {
        return gDomain.update(id, rq);
    }

    @DeleteMapping("/api/guests/{id}")
    public String deleteGuest(@PathVariable Integer id) {
        gDomain.delete(id);
        return "Deleted guest successfully";
    }

    @GetMapping("/api/guests/{guestId}/stays")
    public GuestStayResponse getStaysOfGuest(@PathVariable Integer guestId) {
        return resDomain.getStaysOfGuest(guestId);
    }

    // ─── User Legacy Endpoints (from PersonController) ─────────────────────────

    @PostMapping("/api/users")
    public UserResponse createPersonUser(@RequestBody UserCreateRequest rq) {
        return userDomain.create(rq);
    }

    @GetMapping("/api/users")
    public List<UserResponse> getAllPersonUsers() {
        return userDomain.getAll();
    }

    @GetMapping("/api/users/{id}")
    public UserResponse getPersonUserById(@PathVariable Integer id) {
        return userDomain.getById(id);
    }

    @PutMapping("/api/users/{id}")
    public UserResponse updatePersonUser(@PathVariable Integer id, @RequestBody UserCreateRequest rq) {
        return userDomain.update(id, rq);
    }

    @DeleteMapping("/api/users/{id}")
    public String deletePersonUser(@PathVariable Integer id) {
        userDomain.delete(id);
        return "Deleted user successfully";
    }

    // ─── Admin User Management Endpoints (from UserManagementController) ────────

    @PostMapping("/api/admin/users")
    public ResponseEntity<ApiResponse<User>> createAdminUser(@RequestBody AdminCreateUserRequest request) {
        try {
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

            return ResponseEntity.ok(ApiResponse.success("User created successfully", user));

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to create user: " + e.getMessage());
        }
    }

    @GetMapping("/api/admin/users")
    @Transactional(readOnly=true)
    public ResponseEntity<ApiResponse<List<User>>> getAllAdminUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/api/admin/users/{id}")
    public ResponseEntity<ApiResponse<User>> getAdminUserById(@PathVariable Integer id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PutMapping("/api/admin/users/{id}")
    public ResponseEntity<ApiResponse<User>> updateAdminUser(
            @PathVariable Integer id,
            @RequestBody AdminCreateUserRequest request) {
        try {
            User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
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
            
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
            
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update user: " + e.getMessage());
        }
    }

    @DeleteMapping("/api/admin/users/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteAdminUser(@PathVariable Integer id) {
        userDomain.delete(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PutMapping("/api/admin/users/{id}/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(
            @PathVariable Integer id,
            @RequestBody ResetPasswordRequest request) {
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    public static class ResetPasswordRequest {
        private String newPassword;

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}

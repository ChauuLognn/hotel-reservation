package com.hotelreservation.modules.account.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import com.hotelreservation.common.responses.ApiResponse;
import com.hotelreservation.common.enums.RoleName;
import static com.hotelreservation.modules.account.dto.AccountRequests.*;
import static com.hotelreservation.modules.account.dto.AccountResponses.*;
import com.hotelreservation.modules.account.entity.Emp;
import com.hotelreservation.modules.account.entity.Guest;
import com.hotelreservation.modules.account.entity.User;
import com.hotelreservation.modules.account.entity.Role;
import com.hotelreservation.modules.account.repository.EmpRepository;
import com.hotelreservation.modules.account.repository.UserRepository;
import com.hotelreservation.modules.account.repository.RoleRepository;
import com.hotelreservation.modules.account.service.EmpService;
import com.hotelreservation.modules.account.service.GuestService;
import com.hotelreservation.modules.account.service.UserService;
import static com.hotelreservation.modules.reservation.dto.ReservationResponses.GuestStayResponse;
import com.hotelreservation.modules.reservation.service.ReservationService;

import jakarta.validation.Valid;
import java.util.List;

@RestController
public class AccountController {

    @Autowired private EmpService eDomain;
    @Autowired private GuestService gDomain;
    @Autowired private UserService userDomain;
    @Autowired private UserRepository userRepository;
    @Autowired private EmpRepository empRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ReservationService resDomain;

    // --- Employee Management Endpoint (Base: /api/emps) ---

    @PostMapping("/api/emps")
    @PreAuthorize("hasRole('MANAGER')")
    public EmpResponse createEmp(@RequestBody @Valid EmpCreateRequest rq) {
        return eDomain.create(rq);
    }

    @GetMapping("/api/emps")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<EmpResponse> getAllEmps() {
        return eDomain.getAll();
    }

    @GetMapping("/api/emps/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public EmpResponse getEmpById(@PathVariable Integer id) {
        return eDomain.getById(id);
    }

    @PutMapping("/api/emps/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public EmpResponse updateEmp(@PathVariable Integer id, @RequestBody @Valid EmpCreateRequest rq) {
        return eDomain.update(id, rq);
    }

    @DeleteMapping("/api/emps/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public String deleteEmp(@PathVariable Integer id) {
        eDomain.delete(id);
        return "Deleted emp successfully";
    }

    // --- Guest Management Endpoint (Base: /api/guests) ---
    // Note: class-level @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')") originally applied to all these guest endpoints

    @PostMapping("/api/guests")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public GuestResponse createGuest(@RequestBody @Valid GuestCreateRequest rq) {
        return gDomain.create(rq);
    }

    @GetMapping("/api/guests")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<GuestResponse> getAllGuests() {
        return gDomain.getAll();
    }

    @GetMapping("/api/guests/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public GuestResponse getGuestById(@PathVariable Integer id) {
        return gDomain.getById(id);
    }

    @PutMapping("/api/guests/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public GuestResponse updateGuest(@PathVariable Integer id, @RequestBody @Valid GuestCreateRequest rq) {
        return gDomain.update(id, rq);
    }

    @DeleteMapping("/api/guests/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public String deleteGuest(@PathVariable Integer id) {
        gDomain.delete(id);
        return "Deleted guest successfully";
    }

    @GetMapping("/api/guests/{guestId}/stays")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public GuestStayResponse getStaysOfGuest(@PathVariable Integer guestId) {
        return resDomain.getStaysOfGuest(guestId);
    }

    // --- Admin User Management Endpoint (Base: /api/admin/users) ---
    // Note: class-level @PreAuthorize("hasRole('MANAGER')") originally applied to all these endpoints

    @PostMapping("/api/admin/users")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<User>> createAdminUser(@RequestBody @Valid AdminCreateUserRequest request) {
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
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional(readOnly=true)
    public ResponseEntity<ApiResponse<List<User>>> getAllAdminUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/api/admin/users/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<User>> getAdminUserById(@PathVariable Integer id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PutMapping("/api/admin/users/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<User>> updateAdminUser(
            @PathVariable Integer id,
            @RequestBody @Valid AdminCreateUserRequest request) {
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
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Object>> deleteAdminUser(@PathVariable Integer id) {
        userDomain.delete(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PutMapping("/api/admin/users/{id}/reset-password")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Object>> resetPassword(
            @PathVariable Integer id,
            @RequestBody @Valid AdminResetPasswordRequest request) {
        
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }
}

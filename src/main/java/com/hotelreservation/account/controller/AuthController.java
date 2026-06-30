package com.hotelreservation.account.controller;

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
import static com.hotelreservation.account.dto.AccountRequests.*;
import static com.hotelreservation.account.dto.AccountResponses.*;
import com.hotelreservation.account.entity.Emp;
import com.hotelreservation.account.entity.User;
import com.hotelreservation.account.mapper.AccountMapper;
import com.hotelreservation.common.enums.RoleName;
import com.hotelreservation.account.entity.Role;
import com.hotelreservation.account.repository.EmpRepository;
import com.hotelreservation.account.repository.UserRepository;
import com.hotelreservation.account.repository.RoleRepository;
import com.hotelreservation.account.repository.GuestRepository;
import com.hotelreservation.account.entity.Guest;
import com.hotelreservation.security.JwtTokenProvider;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import com.hotelreservation.security.RateLimiterService;

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

    @PostMapping("/login")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody @Valid LoginRequest request, HttpServletRequest servletRequest) {
        String ip = servletRequest.getRemoteAddr();
        String account = request.getAccount();
        if (rateLimiterService.isBlocked("ip:" + ip) || rateLimiterService.isBlocked("account:" + account)) {
            throw new IllegalStateException("Quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau 1 phút.");
        }
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getAccount(),
                    request.getPassword()
                )
            );

            account = authentication.getName();
            User user = userRepository.findByAccount(account)
                    .orElseThrow(() -> new IllegalStateException("User not found after authentication"));

            String jwtToken = JwtTokenProvider.generateToken(account);

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

            LoginResponse loginResponse = new LoginResponse(
                jwtToken,
                user.getId(),
                user.getAccount(),
                empId,
                empName,
                role,
                JwtTokenProvider.getExpirationTime(),
                guestId
            );

            String userEmail = user.getEmp() != null ? user.getEmp().getEmail() : "";
            loginResponse.setUser(new LoginResponse.UserInfo(user.getId(), userEmail, role));

            rateLimiterService.reset("ip:" + ip);
            rateLimiterService.reset("account:" + account);

            return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));

        } catch (AuthenticationException e) {
            throw new org.springframework.security.authentication.BadCredentialsException("Invalid account or password");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful. Please remove token from client.", null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody @Valid RegisterRequest request, HttpServletRequest servletRequest) {
        String ip = servletRequest.getRemoteAddr();
        if (rateLimiterService.isBlocked("ip:" + ip) || rateLimiterService.isBlocked("register:" + request.getAccount())) {
            throw new IllegalStateException("Quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 1 phút.");
        }
        try {
            if (userRepository.findByAccount(request.getAccount()).isPresent()) {
                throw new IllegalStateException("Account already exists");
            }

            if (empRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalStateException("Email already exists");
            }
            if (empRepository.findByPhone(request.getPhone()).isPresent()) {
                throw new IllegalStateException("Phone already exists");
            }
            if (empRepository.findByIdentityNum(request.getIdentityNum()).isPresent()) {
                throw new IllegalStateException("Identity number already exists");
            }

            Emp emp = new Emp();
            String[] nameParts = request.getFullName().split(" ", 2);
            emp.setFirstName(nameParts[0]);
            emp.setLastName(nameParts.length > 1 ? nameParts[1] : "");
            emp.setEmail(request.getEmail());
            emp.setPhone(request.getPhone());
            emp.setAddress(request.getAddress());
            emp.setIdentityNum(request.getIdentityNum());
            
            Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new IllegalStateException("CUSTOMER role not found in database"));
            emp.setRole(customerRole);
            
            emp = empRepository.save(emp);

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

            User user = new User();
            user.setAccount(request.getAccount());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setEmp(emp);
            user.setGuest(guest);
            user = userRepository.save(user);

            return ResponseEntity.ok(ApiResponse.success("User registered successfully", AccountMapper.toResponse(user)));

        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to register user: " + e.getMessage());
        }
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Object>> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        try {
            String account = SecurityContextHolder.getContext().getAuthentication().getName();
            
            User user = userRepository.findByAccount(account)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Old password is incorrect");
            }

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

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
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

    @PostMapping("/refresh")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(HttpServletRequest servletRequest) {
        String authHeader = servletRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String account;
        try {
            account = JwtTokenProvider.extractUsername(token);
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            account = e.getClaims().getSubject();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid token format");
        }

        if (!JwtTokenProvider.validateTokenForRefresh(token, account)) {
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

        String userEmail = user.getEmp() != null ? user.getEmp().getEmail() : "";
        loginResponse.setUser(new LoginResponse.UserInfo(user.getId(), userEmail, role));

        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", loginResponse));
    }
}

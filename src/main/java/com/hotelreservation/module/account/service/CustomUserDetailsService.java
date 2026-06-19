package com.hotelreservation.module.account.service;

import java.util.ArrayList;
import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.hotelreservation.module.account.entity.User;
import com.hotelreservation.module.account.repository.UserRepository;

/**
 * Custom UserDetailsService
 * 
 * Spring Security dùng class này để load user từ database
 * 
 * Flow:
 * 1. User gửi username/password
 * 2. Spring Security gọi loadUserByUsername(username)
 * 3. Trả về UserDetails (username, password, authorities)
 * 4. Spring Security tự động compare password
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Load user từ database theo username (account)
     * 
     * Spring Security tự động gọi method này khi login
     * 
     * @param username - Account của user
     * @return UserDetails object chứa thông tin user
     * @throws UsernameNotFoundException nếu không tìm thấy user
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Tìm user trong database
        User user = userRepository.findByAccount(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Lấy role của user (qua Emp → Role)
        String roleName = "ROLE_USER"; // Default role
        if (user.getEmp() != null && user.getEmp().getRole() != null) {
            roleName = "ROLE_" + user.getEmp().getRole().getName().name();
        }

        // Tạo authorities (quyền hạn)
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(roleName));

        // Trả về UserDetails
        // Spring Security sẽ tự động so sánh password
        return new org.springframework.security.core.userdetails.User(
            user.getAccount(),      // username
            user.getPassword(),     // password (phải là BCrypt hash)
            authorities             // roles/permissions
        );
    }
}
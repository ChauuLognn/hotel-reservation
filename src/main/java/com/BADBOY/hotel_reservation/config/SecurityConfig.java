package com.BADBOY.hotel_reservation.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.BADBOY.hotel_reservation.security.CustomUserDetailsService;
import com.BADBOY.hotel_reservation.security.JwtAuthenticationFilter;

/**
 * Spring Security Configuration
 * 
 * Cấu hình:
 * 1. Password encoder (BCrypt)
 * 2. Authentication provider
 * 3. Security filter chain (public/protected endpoints)
 * 4. JWT filter
 * 5. CORS
 * 6. CSRF disable
 * 7. Stateless session
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Enable @PreAuthorize, @Secured annotations
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    /**
     * PASSWORD ENCODER
     * 
     * BCrypt encoder để hash password
     * Strength = 10 (default, balance giữa security và performance)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * AUTHENTICATION PROVIDER
     * 
     * Cấu hình cách Spring Security authenticate user:
     * 1. Dùng CustomUserDetailsService để load user
     * 2. Dùng BCrypt để compare password
     */
    @SuppressWarnings("deprecation")
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * AUTHENTICATION MANAGER
     * 
     * Manager để authenticate user (dùng trong AuthController)
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * SECURITY FILTER CHAIN
     * 
     * Cấu hình các rule bảo mật:
     * - Public endpoints: /api/auth/**, /api/rooms/available, etc.
     * - Protected endpoints: tất cả còn lại
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CSRF: Disable vì dùng JWT (stateless)
            .csrf(csrf -> csrf.disable())
            
            // CORS: Enable (đã config trong CorsConfig)
            .cors(cors -> {})
            
            .authorizeHttpRequests(auth -> auth
            .anyRequest().permitAll() // CHO PHÉP TẤT CẢ API
            )
            // AUTHORIZATION RULES
            // .authorizeHttpRequests(auth -> auth
            //     // PUBLIC endpoints - Không cần authentication
            //     .requestMatchers(
            //         "/api/auth/**",           // Login/Logout
            //         "/api/rooms/available",   // Tìm phòng trống (cho guest)
            //         "/api/rooms/roomTypes",   // Xem loại phòng (cho guest)
            //         "/api/services"           // Xem dịch vụ (cho guest)
            //     ).permitAll()
                
            //     // PROTECTED endpoints - Cần authentication
            //     .anyRequest().authenticated()
            // )
            
            // SESSION MANAGEMENT: Stateless (không dùng session)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // AUTHENTICATION PROVIDER
            .authenticationProvider(authenticationProvider())
            
            // JWT FILTER: Thêm filter TRƯỚC UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

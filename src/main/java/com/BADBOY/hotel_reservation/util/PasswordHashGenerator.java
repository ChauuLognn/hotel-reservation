package com.BADBOY.hotel_reservation.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Password Hash Generator
 * 
 * Tool để generate BCrypt hash cho passwords
 * 
 * CÁCH DÙNG:
 * 1. Run main method
 * 2. Copy hash output
 * 3. Update vào database
 * 
 * VÍ DỤ:
 * Input:  "123456"
 * Output: "$2a$10$xqZJnB3YqFJsGbPvvPvO8.Y7YQZVJQs1RjPwPCmQPQKqYvLVlJvv6"
 */
public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Danh sách passwords cần hash
        String[] passwords = {
            "123456",
            "admin123",
            "password",
            "user123"
        };
        
        System.out.println("=== BCrypt Password Hashes ===\n");
        
        for (String password : passwords) {
            String hash = encoder.encode(password);
            System.out.println("Password: " + password);
            System.out.println("BCrypt Hash: " + hash);
            System.out.println();
        }
        
        System.out.println("=== SQL UPDATE STATEMENTS ===\n");
        System.out.println("-- Update password '123456' cho tất cả users:");
        System.out.println("UPDATE user SET password = '" + encoder.encode("123456") + "';");
        System.out.println();
        System.out.println("-- Hoặc update từng user cụ thể:");
        System.out.println("UPDATE user SET password = '" + encoder.encode("123456") + "' WHERE account = 'admin';");
    }
}

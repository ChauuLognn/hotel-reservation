package com.BADBOY.hotel_reservation.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS Configuration - Cho phép Frontend gọi API từ domain khác
 * 
 * Cấu hình này cho phép:
 * - Mọi domain có thể gọi API (trong development)
 * - Tất cả HTTP methods (GET, POST, PUT, DELETE)
 * - Credentials (cookies, authorization headers)
 * 
 * LƯU Ý: Trong production, nên giới hạn allowedOrigins chỉ cho domain Frontend thực tế
 * Ví dụ: .allowedOrigins("https://hotel-frontend.com")
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")  // Áp dụng cho tất cả endpoints
                .allowedOriginPatterns("*")  // Cho phép mọi origin pattern (hỗ trợ credentials)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD")
                .allowedHeaders("*")
                .allowCredentials(true)  // Cho phép credentials (cookies, authorization)
                .exposedHeaders("Authorization", "Content-Type")
                .maxAge(3600);  // Cache preflight request trong 1 giờ
    }
}

package com.hotelreservation.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {
    private static final List<String> ALLOWED_METHODS = List.of(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD");

    private static final List<String> ALLOWED_HEADERS = List.of(
            "Authorization", "Content-Type", "X-User-Id", "X-User_id",
            "Accept", "Origin", "X-Requested-With");

    private static final List<String> EXPOSED_HEADERS = List.of(
            "Authorization", "Content-Type", "X-User-Id", "X-User_id");

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${CORS_ALLOWED_ORIGINS:}") List<String> allowedOrigins) {
        CorsConfiguration configuration = new CorsConfiguration();
        if (allowedOrigins != null && !allowedOrigins.isEmpty() && !(allowedOrigins.size() == 1 && allowedOrigins.get(0).isEmpty())) {
            configuration.setAllowedOrigins(allowedOrigins);
            configuration.setAllowCredentials(true);
        } else {
            configuration.setAllowedOrigins(List.of("*"));
            configuration.setAllowCredentials(false);
        }
        configuration.setAllowedMethods(ALLOWED_METHODS);
        configuration.setAllowedHeaders(ALLOWED_HEADERS);
        configuration.setExposedHeaders(EXPOSED_HEADERS);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

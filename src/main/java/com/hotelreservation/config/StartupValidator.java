package com.hotelreservation.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import org.springframework.context.annotation.Profile;
import com.hotelreservation.account.repository.UserRepository;

import org.springframework.core.annotation.Order;

/**
 * Startup validator component that ensures required configuration is present.
 * Fails fast on startup if critical environment variables or database state are invalid.
 */
@Component
@Profile("!test")
@Order(3)
public class StartupValidator implements CommandLineRunner {

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        validateJwtSecret();
        validateSystemUserId();
    }

    private void validateJwtSecret() {
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            throw new IllegalStateException(
                    "CRITICAL: JWT_SECRET environment variable is not set. "
                    + "Application cannot start without a secure JWT secret. "
                    + "Please set JWT_SECRET environment variable with a value of at least 256 bits."
            );
        }
        if (jwtSecret.length() < 32) {
            throw new IllegalStateException(
                    "CRITICAL: JWT_SECRET is too short (minimum 32 characters required for HS256). "
                    + "Current length: " + jwtSecret.length() + " characters."
            );
        }
        System.out.println("[StartupValidator] ✓ JWT_SECRET is properly configured.");
    }

    private void validateSystemUserId() {
        boolean systemUserExists = userRepository.findByAccount("system").isPresent();
        if (!systemUserExists) {
            throw new IllegalStateException(
                    "CRITICAL: System user with account 'system' does not exist in database. "
                    + "Please ensure the system user is seeded before starting the application."
            );
        }
        System.out.println("[StartupValidator] ✓ System user with account 'system' exists in database.");
    }
}

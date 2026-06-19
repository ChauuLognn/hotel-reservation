package com.hotelreservation.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.hotelreservation.common.enums.RoleName;
import com.hotelreservation.module.account.entity.Role;
import com.hotelreservation.module.account.repository.RoleRepository;

/**
 * Tự động khởi tạo dữ liệu cần thiết khi ứng dụng start.
 * Idempotent: chạy lại nhiều lần không tạo trùng.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        allowNullableUserEmployee();
        seedRoleIfMissing(RoleName.MANAGER);
        seedRoleIfMissing(RoleName.EMPLOYEE);
        System.out.println("[DataSeeder] Roles seeded successfully.");
    }

    private void allowNullableUserEmployee() {
        try {
            jdbcTemplate.execute("ALTER TABLE `user` MODIFY COLUMN `empId` INT NULL");
        } catch (Exception e) {
            System.out.println("[DataSeeder] Skip user.empId nullable migration: " + e.getMessage());
        }
    }

    private void seedRoleIfMissing(RoleName roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
            System.out.println("[DataSeeder] Created role: " + roleName);
        }
    }
}

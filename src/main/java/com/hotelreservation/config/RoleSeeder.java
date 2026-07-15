package com.hotelreservation.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.hotelreservation.common.enums.RoleName;
import com.hotelreservation.account.entity.Role;
import com.hotelreservation.account.repository.RoleRepository;

import org.springframework.core.annotation.Order;

/**
 * Seeds required roles on every startup in all environments.
 * This is critical infrastructure that must exist before the application runs.
 * Idempotent: safe to run on every startup.
 */
@Component
@Order(1)
public class RoleSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        seedRoleIfMissing(RoleName.MANAGER);
        seedRoleIfMissing(RoleName.EMPLOYEE);
        seedRoleIfMissing(RoleName.CUSTOMER);
        System.out.println("[RoleSeeder] All required roles are configured.");
    }

    private void seedRoleIfMissing(RoleName roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
            System.out.println("[RoleSeeder] Created role: " + roleName);
        }
    }
}

package com.hotelreservation.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.hotelreservation.common.enums.RoleName;
import com.hotelreservation.account.entity.Emp;
import com.hotelreservation.account.entity.Role;
import com.hotelreservation.account.entity.User;
import com.hotelreservation.account.repository.EmpRepository;
import com.hotelreservation.account.repository.RoleRepository;
import com.hotelreservation.account.repository.UserRepository;

import java.util.UUID;

/**
 * Seeds the system user 'system' in all environments (including production).
 * Runs at Order(2), after roles have been seeded.
 */
@Component
@Profile("!test")
@Order(2)
public class SystemUserSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmpRepository empRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByAccount("system").isPresent()) {
            System.out.println("[SystemUserSeeder] System user 'system' already exists.");
            return;
        }

        Role managerRole = roleRepository.findByName(RoleName.MANAGER)
                .orElseThrow(() -> new IllegalStateException("MANAGER role not found"));

        Emp emp = new Emp();
        emp.setFirstName("System");
        emp.setLastName("Robot");
        emp.setEmail("system@hotelhaven.com");
        emp.setPhone("0000000000");
        emp.setAddress("System");
        emp.setIdentityNum("000000000000");
        emp.setRole(managerRole);
        emp = empRepository.save(emp);

        User user = new User();
        user.setAccount("system");
        // Random secure password for the production-safe system user.
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setEmp(emp);
        userRepository.save(user);
        System.out.println("[SystemUserSeeder] Created system user 'system' successfully.");
    }
}

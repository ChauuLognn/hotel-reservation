package com.hotelreservation.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.hotelreservation.common.enums.RoleName;
import com.hotelreservation.modules.account.entity.Role;
import com.hotelreservation.modules.account.entity.Emp;
import com.hotelreservation.modules.account.entity.User;
import com.hotelreservation.modules.account.repository.RoleRepository;
import com.hotelreservation.modules.account.repository.EmpRepository;
import com.hotelreservation.modules.account.repository.UserRepository;

/**
 * Tự động khởi tạo dữ liệu cần thiết khi ứng dụng start.
 * Idempotent: chạy lại nhiều lần không tạo trùng.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmpRepository empRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        seedRoleIfMissing(RoleName.MANAGER);
        seedRoleIfMissing(RoleName.EMPLOYEE);
        seedRoleIfMissing(RoleName.CUSTOMER);
        seedSystemUserIfMissing();
        System.out.println("[DataSeeder] Roles and System User seeded successfully.");
    }

    private void seedRoleIfMissing(RoleName roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
            System.out.println("[DataSeeder] Created role: " + roleName);
        }
    }

    private void seedSystemUserIfMissing() {
        if (userRepository.findByAccount("system").isEmpty()) {
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
            user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            user.setEmp(emp);
            userRepository.save(user);
            System.out.println("[DataSeeder] Created system user 'system'.");
        }
    }
}

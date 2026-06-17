package config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import common.enums.RoleName;
import modules.account.entity.Role;
import modules.account.repository.RoleRepository;

/**
 * Tự động khởi tạo dữ liệu cần thiết khi ứng dụng start.
 * Idempotent: chạy lại nhiều lần không tạo trùng.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        seedRoleIfMissing(RoleName.MANAGER);
        seedRoleIfMissing(RoleName.EMPLOYEE);
        System.out.println("[DataSeeder] Roles seeded successfully.");
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

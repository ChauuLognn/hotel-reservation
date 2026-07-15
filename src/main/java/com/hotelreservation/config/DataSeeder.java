package com.hotelreservation.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.hotelreservation.common.enums.RoleName;
import com.hotelreservation.account.entity.Emp;
import com.hotelreservation.account.entity.Guest;
import com.hotelreservation.account.entity.Role;
import com.hotelreservation.account.entity.User;
import com.hotelreservation.account.repository.EmpRepository;
import com.hotelreservation.account.repository.GuestRepository;
import com.hotelreservation.account.repository.RoleRepository;
import com.hotelreservation.account.repository.UserRepository;

import org.springframework.core.annotation.Order;

/**
 * Seeds demo accounts for local development ONLY.
 * This component only runs when spring.profiles.active=dev.
 * Idempotent: safe to run on every startup.
 */
@Component
@Profile("dev")
@Order(3)
public class DataSeeder implements CommandLineRunner {

    // WARNING: Demo password is only for development environments.
    // NEVER use these credentials in production.
    private static final String DEMO_PASSWORD = "123456";

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmpRepository empRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        System.out.println("[DataSeeder] Running in DEVELOPMENT mode - seeding demo data.");
        seedDemoUserIfMissing(
                "admin",
                DEMO_PASSWORD,
                RoleName.MANAGER,
                "Admin",
                "Manager",
                "admin@hotelhaven.com",
                "0900000001",
                "1 Admin Street",
                "111111111111");
        seedDemoUserIfMissing(
                "employee",
                DEMO_PASSWORD,
                RoleName.EMPLOYEE,
                "Hotel",
                "Staff",
                "employee@hotelhaven.com",
                "0900000002",
                "2 Staff Street",
                "222222222222");
        seedDemoUserIfMissing(
                "customer",
                DEMO_PASSWORD,
                RoleName.CUSTOMER,
                "Demo",
                "Customer",
                "customer@hotelhaven.com",
                "0900000003",
                "3 Guest Street",
                "333333333333");
        System.out.println("[DataSeeder] Demo users seeded successfully (development mode).");
    }

    private void seedDemoUserIfMissing(
            String account,
            String rawPassword,
            RoleName roleName,
            String firstName,
            String lastName,
            String email,
            String phone,
            String address,
            String identityNum) {
        if (userRepository.findByAccount(account).isPresent()) {
            return;
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException(roleName + " role not found"));

        Emp emp = new Emp();
        emp.setFirstName(firstName);
        emp.setLastName(lastName);
        emp.setEmail(email);
        emp.setPhone(phone);
        emp.setAddress(address);
        emp.setIdentityNum(identityNum);
        emp.setRole(role);
        emp = empRepository.save(emp);

        Guest guest = new Guest();
        guest.setFirstName(firstName);
        guest.setLastName(lastName);
        guest.setPhone(phone);
        guest.setIdentityNum(identityNum);
        guest = guestRepository.save(guest);

        User user = new User();
        user.setAccount(account);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setEmp(emp);
        user.setGuest(guest);
        userRepository.save(user);

        System.out.println("[DataSeeder] Created demo user '" + account + "' with role " + roleName);
    }
}

package com.hotelreservation.modules.account.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hotelreservation.modules.account.entity.Role;
import com.hotelreservation.common.enums.RoleName;

/**
 * Repository cho Role
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    
    /**
     * Tìm role theo tên
     */
    Optional<Role> findByName(RoleName name);
}
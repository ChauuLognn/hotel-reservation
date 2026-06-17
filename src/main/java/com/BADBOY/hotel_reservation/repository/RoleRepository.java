package com.BADBOY.hotel_reservation.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.BADBOY.hotel_reservation.entity.Role;
import com.BADBOY.hotel_reservation.entity.Enum.RoleName;

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

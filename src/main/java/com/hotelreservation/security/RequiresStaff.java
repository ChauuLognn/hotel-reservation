package com.hotelreservation.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Custom annotation for methods that require MANAGER or EMPLOYEE role.
 * Replaces hardcoded @PreAuthorize("hasAnyRole('MANAGER','EMPLOYEE')")
 * Use this for cleaner, more maintainable authorization declarations.
 * 
 * Example:
 *   @RequiresStaff
 *   @GetMapping("/api/reservations/all")
 *   public List<ReservationDTO> getAllReservations() { ... }
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
public @interface RequiresStaff {
    /**
     * Optional description of why staff access is required
     */
    String value() default "Staff (Manager or Employee) access required";
}

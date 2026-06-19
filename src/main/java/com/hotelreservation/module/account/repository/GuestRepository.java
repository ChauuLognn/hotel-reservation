package com.hotelreservation.module.account.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hotelreservation.module.account.entity.Guest;

@Repository
public interface GuestRepository extends JpaRepository<Guest, Integer>{
    @Query(value = "SELECT * FROM guest WHERE id = :id", nativeQuery = true)
    Optional<Guest> findGuestById(@Param("id") Integer id);

    @Query(value="select * from guest where identityNum = :identityNum", nativeQuery=true)
    Optional<Guest> findGuestByIdentityNum(@Param("identityNum") String IdentityNum);
    
    @Query(value = "SELECT * FROM guest", nativeQuery = true)
    List<Guest> takeAll();

    @Modifying
    @Query(value = """
        INSERT INTO guest (firstName, lastName, identityNum, phone, dateOfBirth)
        VALUES (:firstName, :lastName, :identityNum, :phone, :dateOfBirth)
        """, nativeQuery = true)
    void insertGuest(
        @Param("firstName") String firstName,
        @Param("lastName") String lastName,
        @Param("identityNum") String identityNum,
        @Param("phone") String phone,
        @Param("dateOfBirth") LocalDate dateOfBirth
    );

    @Modifying
    @Query(value = """
        UPDATE guest
        SET firstName   = :firstName,
            lastName    = :lastName,
            identityNum = :identityNum,
            phone       = :phone,
            dateOfBirth = :dateOfBirth
        WHERE id = :id
        """, nativeQuery = true)
    void updateGuest(
        @Param("id") Integer id,
        @Param("firstName") String firstName,
        @Param("lastName") String lastName,
        @Param("identityNum") String identityNum,
        @Param("phone") String phone,
        @Param("dateOfBirth") LocalDate dateOfBirth
    );

    @Modifying
    @Query(value = "DELETE FROM guest WHERE id = :id", nativeQuery = true)
    void deleteGuest(@Param("id") Integer id);
}
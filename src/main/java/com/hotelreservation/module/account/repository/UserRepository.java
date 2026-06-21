package com.hotelreservation.module.account.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.hotelreservation.module.account.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer>{
    @Query(value = "SELECT * FROM user WHERE id = :id", nativeQuery = true)
    Optional<User> findUserById(@Param("id") Integer id);

    @Query(value = "select * from user where empId = :empId", nativeQuery = true)
    Optional<User> findUserByEmpId(@Param("empId") Integer empId);

    @Query(value = "select * from user where empId = :empId", nativeQuery = true)
    List<User> findByEmpId(@Param("empId") Integer empId);

    @Query(value = "SELECT * FROM user WHERE account = :account", nativeQuery = true)
    Optional<User> findByAccount(@Param("account") String account);

    @Query(value = "SELECT * FROM user", nativeQuery = true)
    List<User> takeAll();

    @Query(value = """
        SELECT (
            (SELECT COUNT(*) FROM reservation WHERE createdBy = :id) +
            (SELECT COUNT(*) FROM reservationService WHERE createdBy = :id) +
            (SELECT COUNT(*) FROM reservationStatusHistory WHERE updatedBy = :id)
        )
        """, nativeQuery = true)
    Long countBusinessReferencesByUserId(@Param("id") Integer id);

    @Modifying
    @Query(value = """
        INSERT INTO user (empId, account, password)
        VALUES (:empId, :account, :password)
        """, nativeQuery = true)
    void insertUser(
        @Param("empId") Integer empId,
        @Param("account") String account,
        @Param("password") String password
    );

    @Modifying
    @Query(value = """
        UPDATE user
        SET account = :account,
            password = :password
        WHERE id = :id
        """, nativeQuery = true)
    void updateUser(
        @Param("id") Integer id,
        @Param("account") String account,
        @Param("password") String password
    );

    @Modifying
    @Query(value = "DELETE FROM user WHERE id = :id", nativeQuery = true)
    void deleteUser(@Param("id") Integer id);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Transactional
    @Query(value = "UPDATE user SET empId = NULL WHERE empId = :empId", nativeQuery = true)
    void unlinkEmpFromUsers(@Param("empId") Integer empId);
}

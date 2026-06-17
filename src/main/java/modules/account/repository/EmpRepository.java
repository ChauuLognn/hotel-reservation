package modules.account.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import modules.account.entity.Emp;

@Repository
public interface EmpRepository extends JpaRepository<Emp, Integer> {
    @Query(value = "SELECT * FROM emp WHERE id = :id", nativeQuery = true)
    Optional<Emp> findEmpById(@Param("id") Integer id);

    @Query(value="select * from emp where identityNum = :identityNum", nativeQuery=true)
    Optional<Emp> findEmpByIdentityNum(@Param("identityNum") String identityNum);

    @Query(value = "SELECT * FROM emp", nativeQuery = true)
    List<Emp> takeAll();

    // Thêm methods để check duplicate khi register
    Optional<Emp> findByEmail(String email);
    Optional<Emp> findByPhone(String phone);
    Optional<Emp> findByIdentityNum(String identityNum);

    @Modifying
    @Query(value = """
        INSERT INTO emp (firstName, lastName, dateOfBirth,
                         identityNum, email, phone, address, role)
        VALUES (:firstName, :lastName, :dateOfBirth,
                :identityNum, :email, :phone, :address, :role)
        """, nativeQuery = true)
    void insertEmp(
        @Param("firstName") String firstName,
        @Param("lastName") String lastName,
        @Param("dateOfBirth") LocalDate dateOfBirth,
        @Param("identityNum") String identityNum,
        @Param("email") String email,
        @Param("phone") String phone,
        @Param("address") String address,
        @Param("role") Integer role
    );

    @Modifying
    @Query(value = """
        UPDATE emp
        SET firstName   = :firstName,
            lastName    = :lastName,
            dateOfBirth = :dateOfBirth,
            identityNum = :identityNum,
            email       = :email,
            phone       = :phone,
            address     = :address,
            role        = :role
        WHERE id = :id
        """, nativeQuery = true)
    void updateEmp(
        @Param("id") Integer id,
        @Param("firstName") String firstName,
        @Param("lastName") String lastName,
        @Param("dateOfBirth") LocalDate dateOfBirth,
        @Param("identityNum") String identityNum,
        @Param("email") String email,
        @Param("phone") String phone,
        @Param("address") String address,
        @Param("role") Integer role
    );

    @Modifying
    @Query(value = "DELETE FROM emp WHERE id = :id", nativeQuery = true)
    void deleteEmp(@Param("id") Integer id);
    
}
package modules.hotel_service.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import modules.hotel_service.entity.Service;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Integer>{
    @Query(value="""
        select * from service
    """, nativeQuery=true)
    List<Service> takeAll();

    @Query(value="""
        select *
        from service
        where name = :name
    """, nativeQuery=true)
    Optional<Service> findByName(@Param("name") String name);

    @Modifying
    @Query(value="""
        insert into service (name, price, status)
            values (:name, :price, "ACTIVE")
    """,nativeQuery=true)
    void insertService(@Param("name") String name,
        @Param("price") BigDecimal price);

    @Modifying
    @Query(value="""
        UPDATE service
        SET price   = :price,
            status    = :status
        WHERE name = :name
    """,nativeQuery=true)
    void updateService(@Param("name") String name,
        @Param("price") BigDecimal price, @Param("status") String status);

    @Modifying
    @Query(value = "DELETE FROM service WHERE name = :name", nativeQuery = true)
    void deleteSer(@Param("name") String name);
}
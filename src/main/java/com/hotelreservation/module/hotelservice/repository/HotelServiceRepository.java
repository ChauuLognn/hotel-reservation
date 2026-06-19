<<<<<<<< HEAD:src/main/java/modules/hotelservice/repository/ServiceRepository.java
package modules.hotelservice.repository;
========
package com.hotelreservation.module.hotelservice.repository;
>>>>>>>> cbefeac3b6cddeb05a11784a799ae6ee9e5b4f93:src/main/java/com/hotelreservation/module/hotelservice/repository/HotelServiceRepository.java

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

<<<<<<<< HEAD:src/main/java/modules/hotelservice/repository/ServiceRepository.java
import modules.hotelservice.entity.Service;
========
import com.hotelreservation.module.hotelservice.entity.HotelService;
>>>>>>>> cbefeac3b6cddeb05a11784a799ae6ee9e5b4f93:src/main/java/com/hotelreservation/module/hotelservice/repository/HotelServiceRepository.java

@Repository
public interface HotelServiceRepository extends JpaRepository<HotelService, Integer> {
    @Query(value="""
        select * from service
    """, nativeQuery=true)
    List<HotelService> takeAll();

    @Query(value="""
        select *
        from service
        where name = :name
    """, nativeQuery=true)
    Optional<HotelService> findByName(@Param("name") String name);

    @Modifying
    @Query(value="""
        insert into service (name, price, status)
            values (:name, :price, 'ACTIVE')
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

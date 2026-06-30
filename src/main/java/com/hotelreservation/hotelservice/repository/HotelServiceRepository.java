package com.hotelreservation.hotelservice.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hotelreservation.hotelservice.entity.HotelService;

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
            values (:name, :price, :status)
    """,nativeQuery=true)
    void insertService(@Param("name") String name,
        @Param("price") BigDecimal price,
        @Param("status") String status);

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

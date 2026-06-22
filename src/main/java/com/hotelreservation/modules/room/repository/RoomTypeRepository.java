package com.hotelreservation.modules.room.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hotelreservation.modules.room.entity.RoomType;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    @Query(value = """
        select *
        from roomType
    """, nativeQuery=true)
    List<RoomType> takeAll();

    @Query(value = "SELECT * FROM roomType WHERE name = :name LIMIT 1", nativeQuery = true)
    Optional<RoomType> findByName(@Param("name") String name);

    @Modifying
    @Query(value = """
        INSERT INTO roomType (name, capacity, basePrice, description)
        VALUES (:name, :capacity, :basePrice, :description)
    """, nativeQuery = true)
    void insertRoomType(
        @Param("name") String name,
        @Param("capacity") Byte capacity,
        @Param("basePrice") BigDecimal basePrice,
        @Param("description") String description
    );

    @Modifying
    @Query(value = """
        UPDATE roomType 
        SET name = :newName,
            capacity = :capacity,
            basePrice = :basePrice,
            description = :description
        WHERE name = :oldName
    """, nativeQuery = true)
    void updateRoomType(@Param("oldName") String oldName,
                        @Param("newName") String newName,
                        @Param("capacity") Byte capacity,
                        @Param("basePrice") BigDecimal basePrice,
                        @Param("description") String description);

    @Modifying
    @Query(value = "DELETE FROM roomType WHERE name = :name", nativeQuery = true)
    void deleteByName(@Param("name") String name);

}
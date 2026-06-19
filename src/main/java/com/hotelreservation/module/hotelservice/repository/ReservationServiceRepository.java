<<<<<<<< HEAD:src/main/java/modules/hotelservice/repository/ReservationServiceRepository.java
package modules.hotelservice.repository;
========
package com.hotelreservation.module.hotelservice.repository;
>>>>>>>> cbefeac3b6cddeb05a11784a799ae6ee9e5b4f93:src/main/java/com/hotelreservation/module/hotelservice/repository/ReservationServiceRepository.java

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

<<<<<<<< HEAD:src/main/java/modules/hotelservice/repository/ReservationServiceRepository.java
import modules.report.dto.ServiceUsageProjection;
import modules.hotelservice.entity.ReservationService;
========
import com.hotelreservation.module.report.projection.ServiceUsageProjection;
import com.hotelreservation.module.hotelservice.entity.ReservationService;
>>>>>>>> cbefeac3b6cddeb05a11784a799ae6ee9e5b4f93:src/main/java/com/hotelreservation/module/hotelservice/repository/ReservationServiceRepository.java

@Repository
public interface ReservationServiceRepository extends JpaRepository<ReservationService, String>{
    @Query(value="""
        select *
        from reservationService rs
        where rs.reservationRoomId = :resRoomId
    """, nativeQuery=true)
    List<ReservationService> getByResRoomId(@Param("resRoomId") String resRoomId);

    @Query(value="""
        select *
        from reservationService rs
        where rs.reservationRoomId = :resRoomId and rs.serviceId = :serId
    """, nativeQuery=true)
    Optional<ReservationService> getByResRoomIdAndSerId(@Param("resRoomId") String resRoomId,
                                                        @Param("serId") Integer serId);

    @Modifying
    @Transactional
    @Query(value="""
        insert into reservationService (id, reservationRoomId, serviceId,
                quantity, totalAmount, usedAt, createdBy)
            values (:id, :resRoomId, :serId, :quantity, :totalAmount, :usedAt, :createdBy)
    """, nativeQuery=true)
    void insertResService(@Param("id") String id,
                        @Param("resRoomId") String resRoomId,
                        @Param("serId") Integer serId,
                        @Param("quantity") Byte quantity,
                        @Param("totalAmount") BigDecimal totalAmount,
                        @Param("usedAt") LocalDateTime usedAt,
                        @Param("createdBy") Integer createdBy);

    @Modifying
    @Transactional
    @Query(value = """
        UPDATE reservationService
        SET reservationRoomId = :resRoomId,
            serviceId = :serId,
            quantity = :quantity,
            totalAmount = :totalAmount,
            usedAt = :usedAt,
            createdBy = :createdBy
        WHERE id = :id
    """, nativeQuery = true)
    void update(@Param("id") String id,
                @Param("resRoomId") String resRoomId,
                @Param("serId") Integer serId,
                @Param("quantity") Byte quantity,
                @Param("totalAmount") BigDecimal totalAmount,
                @Param("usedAt") LocalDateTime usedAt,
                @Param("createdBy") Integer createdBy);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM reservationService WHERE id = :id", nativeQuery = true)
    void delete(@Param("id") String id);

    @Query(value = """
        SELECT
            s.name AS serviceName,
            COUNT(*)        AS timesUsed,
            SUM(rs.quantity) AS totalQuantity,
            SUM(rs.totalAmount)    AS totalRevenue
        FROM reservationService rs
        JOIN service s         ON rs.serviceId = s.id
        JOIN reservationRoom rr ON rs.reservationRoomId = rr.id
        JOIN reservation res    ON rr.reservationId = res.id
        WHERE rr.checkOutTime >= :from
          AND rr.checkOutTime < :to
          AND res.status <> 'CANCELLED'
        GROUP BY s.id, s.name
        ORDER BY rr.checkOutTime DESC
        """, nativeQuery = true)
    List<ServiceUsageProjection> getServiceUsage(
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );    
}

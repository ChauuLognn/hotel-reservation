package modules.reservation.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import modules.report.dto.RoomUsageProjection;
import modules.reservation.entity.ReservationRoom;

@Repository
public interface ReservationRoomRepository extends  JpaRepository<ReservationRoom, String>{
    @Modifying
    @Query(value = """
        insert into reservationRoom (id, reservationId, roomId, checkInTime, checkOutTime, unitPrice, totalPrice)
        values (:id, :resId, :roomId, :checkInTime, :checkOutTime, :unitPrice, :totalPrice)
    """, nativeQuery = true)
    void insertResRoom(
        @Param("id") String id,
        @Param("resId") String resId, 
        @Param("roomId") Integer roomId,
        @Param("checkInTime") LocalDate checkInTime, 
        @Param("checkOutTime") LocalDate checkOutTime,
        @Param("unitPrice") BigDecimal unitPrice, 
        @Param("totalPrice") BigDecimal totalPrice);

    @Query(value="""
        select *
        from reservationRoom rr
        where rr.id = :resRoomId
    """,nativeQuery=true)
    Optional<ReservationRoom> getByResRoomId(@Param("resRoomId") String resRoomId);

    @Query(value="""
        select *
        from reservationRoom rr
        where rr.reservationId = :resId and rr.roomId = :roomId
    """,nativeQuery=true)
    Optional<ReservationRoom> findByResIdAndRoomId(@Param("resId") String resId,
                                                @Param("roomId") Integer roomId);

    @Query(value = """
        SELECT COALESCE(SUM(totalPrice),0) 
        FROM reservationRoom 
        WHERE reservationId = :resId
    """, nativeQuery = true)
    BigDecimal sumFinalByReservation(@Param("resId") String resId);

    @Query(value="""
        select *
        from reservationRoom rr
        where rr.reservationId = :resId
    """, nativeQuery = true)
    List<ReservationRoom> findByReservationId(@Param("resId") String resId);

    @Query(value = """
        SELECT
            r.id    AS roomId,
            rt.name AS roomTypeName,
            COUNT(*) AS timesBooked,
            SUM(
                DATEDIFF(
                    LEAST(rr.checkOutTime, :toDate),
                    GREATEST(rr.checkInTime, :fromDate)
                )
            ) AS totalNights
        FROM reservationRoom rr
        JOIN room r      ON rr.roomId = r.id
        JOIN roomType rt ON r.typeId = rt.id
        JOIN reservation res ON rr.reservationId = res.id
        WHERE rr.checkInTime < :toDate
          AND rr.checkOutTime > :fromDate
          AND res.status <> 'CANCELLED'
        GROUP BY r.id, rt.name
        HAVING SUM(
            DATEDIFF(
                LEAST(rr.checkOutTime, :toDate),
                GREATEST(rr.checkInTime, :fromDate)
            )
        ) > 0
        ORDER BY timesBooked DESC
        """, nativeQuery = true)
    List<RoomUsageProjection> getRoomUsage(
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );
}
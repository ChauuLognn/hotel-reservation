package com.hotelreservation.modules.reservation.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hotelreservation.modules.reservation.entity.ReservationStatusHistory;

@Repository
public interface ReservationStatusHistoryRepository extends JpaRepository<ReservationStatusHistory, Long>{
    @Query(value="""
        select *
        from reservationStatusHistory rsh
        join reservationRoom rr on rr.id = rsh.reservationRoomId
        where rr.reservationId = :resId
        order by rsh.updatedAt desc
    """,nativeQuery=true)
    List<ReservationStatusHistory> findByResId(String resId);

    @Query(value="""
        select * 
        from reservationStatusHistory rsh
        where rsh.reservationRoomId = :resRoomId
        order by rsh.updatedAt desc
    """,nativeQuery=true)
    List<ReservationStatusHistory> findByResRoomId(@Param("resRoomId") String resRoomId);

    @Query(value="""
        SELECT *
        FROM ReservationStatusHistory h 
        WHERE h.reservationRoomId = :resRoomId 
        ORDER BY h.updatedAt DESC, h.historySeq DESC 
        limit 1
    """, nativeQuery=true)
    Optional<ReservationStatusHistory> findLatestByResRoomId(@Param("resRoomId") String resRoomId);
    
    @Modifying
    @Query(value = """
        INSERT INTO reservationStatusHistory (
            reservationRoomId, historySeq, oldStatus, newStatus,
            updatedAt, updatedBy, reason
        )
        SELECT :resRoomId, COALESCE(MAX(h.historySeq), 0) + 1,
            :oldStatus, :newStatus, :updatedAt, :updatedBy, :reason
        FROM reservationStatusHistory h
        WHERE h.reservationRoomId = :resRoomId
    """, nativeQuery = true)
    void insertResStatusHistory(
        @Param("resRoomId") String resRoomId,
        @Param("oldStatus") String oldStatus,
        @Param("newStatus") String newStatus,
        @Param("updatedAt") LocalDateTime updatedAt,
        @Param("updatedBy") Integer updatedBy,
        @Param("reason") String reason
    );

    @Query(value="""
        select rr.id
        from (
            SELECT rsh.reservationRoomId
            FROM reservationStatusHistory rsh
            JOIN (
                SELECT reservationRoomId, MAX(id) AS latestId
                FROM reservationStatusHistory
                GROUP BY reservationRoomId
            ) latest ON rsh.id = latest.latestId 
            where rsh.newStatus = 'CHECK_IN'
        ) as tmp
        join reservationRoom rr
        on rr.id = tmp.reservationRoomId
        where timestamp(rr.checkOutTime, '14:00:00') <= :now
    """,nativeQuery=true)
    List<String> findResRoomThatOverCheckOutTime(@Param("now") LocalDateTime now);

    @Query(value = """
        SELECT rsh.*
        FROM reservationStatusHistory rsh
        INNER JOIN (
            SELECT reservationRoomId, MAX(id) as maxId
            FROM reservationStatusHistory
            WHERE reservationRoomId IN (:resRoomIds)
            GROUP BY reservationRoomId
        ) latest ON rsh.id = latest.maxId
    """, nativeQuery = true)
    List<ReservationStatusHistory> findLatestByResRoomIds(@Param("resRoomIds") List<String> resRoomIds);
}

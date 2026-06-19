package com.hotelreservation.module.reservation.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hotelreservation.module.reservation.entity.ReservationGuest;

@Repository
public interface ReservationGuestRepository extends JpaRepository<ReservationGuest, Long>{
    @Query(value="""
        select *
        from reservationGuest rg
        where rg.reservationRoomId = :resRoomId
    """, nativeQuery=true)
    List<ReservationGuest> findByIdReservationRoomId(String resRoomId);

    @Query(value="""
        select *
        from reservationGuest rg
        where rg.guestId = :guestId
        order by rg.checkOutAt desc, rg.checkInAt desc
    """, nativeQuery=true)
    List<ReservationGuest> findByIdGuestId(@Param("guestId") Integer guestId);

    @Query(value="""
        select *
        from reservationGuest rg
        where rg.reservationRoomId = :resRoomId
            and rg.guestId = :guestId
    """, nativeQuery=true)
    Optional<ReservationGuest> findByResRoomIdAndGuestId(
            @Param("resRoomId") String resRoomId,
            @Param("guestId") Integer guestId);

    @Modifying
    @Query(value = """
        INSERT INTO reservationGuest (reservationRoomId, guestId,
                         checkInAt, checkOutAt)
        VALUES (:reservationRoomId, :guestId, null, null)
    """, nativeQuery = true)
    void insertResGuest(
        @Param("reservationRoomId") String reservationRoomId,
        @Param("guestId") Integer guestId
    );


    @Query(value="""
        select count(*)
        from reservationGuest rg
        where rg.reservationRoomId = :resRoomId
            and rg.checkOutAt is null
    """,nativeQuery=true)
    Integer cntGuestHasNotCheckOutInResRoom(@Param("resRoomId") String resRoomId);

    @Query(value = """
        select count(distinct rg.guestId)
        from reservationGuest rg
        where rg.checkInAt >= :from
          and rg.checkInAt < :to
    """, nativeQuery = true)
    Integer countGuestsStayed(
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    @Query(value = """
        SELECT COUNT(DISTINCT rr.reservationId)
        FROM reservationGuest rg
        JOIN reservationRoom rr ON rg.reservationRoomId = rr.id
        WHERE rg.guestId = :guestId
    """, nativeQuery = true)
    Integer countReservationsByGuestId(@Param("guestId") Integer guestId);
}

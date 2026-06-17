package com.BADBOY.hotel_reservation.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.BADBOY.hotel_reservation.entity.reservation_guest.ReservationGuest;
import com.BADBOY.hotel_reservation.entity.reservation_guest.ReservationGuestId;

@Repository
public interface ReservationGuestRepository extends JpaRepository<ReservationGuest, ReservationGuestId>{
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

    @Modifying
    @Query(value = """
        update reservationGuest rg
        set rg.checkInAt = :checkInAt
        where rg.reservationRoomId = :resRoomId
            and rg.guestId = :guestId
            and rg.checkInAt is null
            and now() >= timestamp(rr.checkInTime, '12:00:00')
            and now() < timestamp(rr.checkOutTime, '14:00:00')
        """,
        nativeQuery = true)
    void setCheckIn(
        @Param("resRoomId") String resRoomId,
        @Param("guestId") Integer guestId,
        @Param("checkInAt") LocalDateTime checkInAt
    );

    @Modifying
    @Query(value = """
        update reservationGuest
        set checkOutAt = :checkOutAt
        where reservationRoomId = :resRoomId
            and guestId = :guestId
            and checkInAt is not null
            and checkOutAt is null
            and :checkOutAt >= checkInAt
        """,
        nativeQuery = true)
    void setCheckOut(
        @Param("resRoomId") String resRoomId,
        @Param("guestId") Integer guestId,
        @Param("checkOutAt") LocalDateTime checkOutAt
    );

    @Modifying
    @Query(value= """
        update reservationGuest rg
        join reservationRoom rr on rg.reservationRoomId = rr.id
        set rg.checkOutAt = timestamp(rr.checkOutTime, '14:00:00')
        where rg.checkInAt is not null
            and rg.checkOutAt is null
            and timestamp(rr.checkOutTime, '14:00:00') <= :now;
    """, nativeQuery=true)
    void autoCheckOutByRoomCheckOutTime(@Param("now") LocalDateTime now);

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

}

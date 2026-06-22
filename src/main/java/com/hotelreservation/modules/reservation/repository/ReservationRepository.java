package com.hotelreservation.modules.reservation.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hotelreservation.modules.reservation.entity.Reservation;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, String> {
    @Query(value = "SELECT * FROM reservation WHERE id = :id", nativeQuery=true)
    Reservation getResById(@Param("id") String id);

    @Modifying
    @Query(value = """
        insert into reservation(id, guestId, totalAmount, createdBy, status, bookingDate)
            values (:id, :guestId, :totalAmount, :createdBy, :status, :bookingDate)
    """, nativeQuery=true)
    void insertReservation(@Param("id") String id, @Param("guestId") Integer guestId,
                        @Param("totalAmount") BigDecimal totalAmount, @Param("createdBy") Integer createdBy,
                        @Param("status") String status, @Param("bookingDate") LocalDateTime bookingDate);

    @Query(value= """
        select *
        from reservation r
        where r.guestId = :guestId
    """, nativeQuery=true)
    List<Reservation> getAllResByGuestId(@Param("guestId") Integer guestId);

    @Query(value="""
        select *
        from reservation r
        where r.guestId = :guestId
        order by r.bookingDate desc
        limit 1
    """, nativeQuery=true)
    Optional<Reservation> getLastResByGuestId(@Param("guestId") Integer guestId);

    // Tính lại tổng từ các dòng reservationRoom
    @Modifying
    @Query(value = """
        UPDATE reservation r
        SET r.totalAmount = (
            SELECT COALESCE(SUM(rr.totalPrice), 0)
            FROM reservationRoom rr
            WHERE rr.reservationId = :reservationId
        )
        WHERE r.id = :reservationId
    """, nativeQuery = true)
    int recalculateTotal(@Param("reservationId") String reservationId);

    // Tìm reservation pending quá 30'
    @Query(value= """
        SELECT r.id
        FROM reservation r
        WHERE r.status = 'PENDING_PAYMENT'
        AND DATE_ADD(r.bookingDate, INTERVAL 10 MINUTE) <= :deadLine;
    """, nativeQuery = true)
    List<String> findPendingReservationExpired(LocalDateTime deadLine);

    // Lấy tất cả reservations với đầy đủ thông tin (sử dụng JPQL để eager load relationships)
    @Query("SELECT DISTINCT r FROM Reservation r JOIN FETCH r.guest JOIN FETCH r.createdBy ORDER BY r.bookingDate DESC")
    List<Reservation> findAllReservations();
}
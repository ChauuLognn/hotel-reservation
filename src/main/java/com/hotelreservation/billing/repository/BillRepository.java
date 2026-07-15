package com.hotelreservation.billing.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hotelreservation.report.projection.DailyRevenueProjection;
import com.hotelreservation.billing.entity.Bill;
import com.hotelreservation.billing.dto.BillingResponses.ReservationBillSummaryProjection;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {

    @Query(value = """
        SELECT 
            rr.reservationId AS reservationId,
            SUM(CASE WHEN b.status = 'PAID' THEN b.totalAmount ELSE 0 END) AS totalPaid,
            SUM(CASE WHEN b.status = 'UNPAID' THEN b.totalAmount ELSE 0 END) AS totalDue,
            SUM(b.totalAmount) AS total
        FROM bill b
        JOIN reservationRoom rr ON b.reservationRoomId = rr.id
        GROUP BY rr.reservationId
        """, nativeQuery = true)
    List<ReservationBillSummaryProjection> getReservationBillSummaries();

    @Query(value="""
        select b.* 
        from bill b
        join reservationRoom rr on rr.id = b.reservationRoomId 
        where rr.reservationId = :resId
    """,nativeQuery=true)
    List<Bill> getByResId(@Param("resId") String resId);

    @Query(value="""
        select *
        from bill
        where bill.reservationRoomId = :resRoomId
    """, nativeQuery=true)
    List<Bill> getByResRoomId(@Param("resRoomId") String resRoomId);
    
    @Modifying()
    @Query(value = """
        INSERT INTO bill (id, reservationRoomId, totalAmount, createdAt, reason, status)
        SELECT UUID(), rr.id, rr.totalPrice, :now, 'ROOM_CHARGE', 'PAID'
        FROM reservationRoom rr
        WHERE rr.reservationId = :resId
        """, nativeQuery = true)
    void insertRoomChargeBills(@Param("resId") String resId,
                            @Param("now") LocalDateTime now);

    @Modifying()
    @Query(value = """
        INSERT INTO bill (id, reservationRoomId, totalAmount, createdAt, reason, status)
        SELECT UUID(), rs.reservationRoomId, SUM(rs.totalAmount), :now, 'SERVICE', 'UNPAID'
        FROM reservationService rs
        WHERE rs.reservationRoomId = :resRoomId
        GROUP BY rs.reservationRoomId
        HAVING SUM(rs.totalAmount) > 0
        """, nativeQuery = true)
    void insertServiceBills(@Param("resRoomId") String resRoomId,
                        @Param("now") LocalDateTime now);

    @Modifying()
    @Query(value = """
        INSERT INTO bill (id, reservationRoomId, totalAmount, createdAt, reason, status)
        SELECT UUID(), rr.id, rr.totalPrice, :now, 'REFUND', 'UNPAID'
        FROM reservationRoom rr
        where rr.id = :resRoomId
        """, nativeQuery = true)
    void insertRefundBills(@Param("resRoomId") String resRoomId,
                        @Param("now") LocalDateTime now);

    @Modifying()
    @Query(value = """
        UPDATE bill b
        JOIN reservationRoom rr ON b.reservationRoomId = rr.id
        SET b.status = 'PAID'
        WHERE rr.reservationId = :resId;
    """, nativeQuery = true)
    void markBillsPaidForResId(@Param("resId") String resId);

    @Modifying()
    @Query(value = """
        UPDATE bill SET status = 'PAID'
        WHERE reservationRoomId = :resRoomId
        """, nativeQuery = true)
    void markBillsPaidForResRoomId(@Param("resRoomId") String resRoomId);

    @Query(value = """
        SELECT b.* FROM bill b
        join reservationRoom rr on rr.id = b.reservationRoomId
        WHERE rr.reservationId = :resId
        ORDER BY b.reservationRoomId, b.createdAt
        """, nativeQuery = true)
    List<Bill> findAllByResId(@Param("resId") String resId);

    @Query(value = """
        SELECT
            DATE(rr.checkOutTime) AS date,
            SUM(CASE
                    WHEN b.reason = 'ROOM_CHARGE' AND b.status = 'PAID'
                    THEN b.totalAmount ELSE 0
                END) AS roomCharge,
            SUM(CASE
                    WHEN b.reason = 'SERVICE' AND b.status = 'PAID'
                    THEN b.totalAmount ELSE 0
                END) AS serviceCharge,
            SUM(CASE
                    WHEN b.reason = 'REFUND' AND b.status = 'PAID'
                    THEN b.totalAmount ELSE 0
                END) AS refundAmount,
            SUM(
                CASE
                    WHEN b.status = 'PAID' THEN
                        CASE
                            WHEN b.reason = 'REFUND' THEN -b.totalAmount
                            ELSE b.totalAmount
                        END
                    ELSE 0
                END
            ) AS netRevenue
        FROM bill b
        join reservationRoom rr on rr.id = b.reservationRoomId
        WHERE rr.checkOutTime >= :from
          AND rr.checkOutTime <= :to
        GROUP BY DATE(rr.checkOutTime)
        ORDER BY DATE(rr.checkOutTime)
        """, nativeQuery = true)
    List<DailyRevenueProjection> getDailyRevenue(
        @Param("from") java.time.LocalDate from,
        @Param("to") java.time.LocalDate to
    );    

}

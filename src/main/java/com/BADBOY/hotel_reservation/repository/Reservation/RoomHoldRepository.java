// package com.BADBOY.hotel_reservation.repository.Reservation;

// import java.math.BigDecimal;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
// import java.util.List;

// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Modifying;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;
// import org.springframework.stereotype.Repository;

// import com.BADBOY.hotel_reservation.entity.RoomHold;


// @Repository
// public interface RoomHoldRepository extends JpaRepository<RoomHold, String> {

//     @Query(value = """
//         SELECT h.id
//         FROM roomHold h
//         WHERE h.roomId IN (:ids)
//           AND h.checkIn  < :checkOut
//           AND h.checkOut > :checkIn
//           AND h.expiresAt > :now
//         FOR UPDATE
//     """, nativeQuery = true)
//     List<String> lockActiveOverlaps(@Param(value = "ids")List<Integer> roomIds, 
//                                 @Param(value = "checkIn") LocalDate checkIn, 
//                                 @Param(value = "checkOut") LocalDate checkOut, 
//                                 @Param(value = "now") LocalDateTime now);
//     @Modifying
//     @Query(value="""
//         insert into roomHold (id, guestId, roomId, checkIn, checkOut, 
//                         expiresAt, token, createdAt, finalPrice)
//             values (:id, :guestId, :roomId, :checkIn, :checkOut, 
//                         :expiresAt, :token, :createdAt, :finalPrice)
//     """,nativeQuery=true)
//     void insertRoomHold(@Param("id") String id, @Param("guestId") Integer guestId, 
//                     @Param("roomId") Integer roomId, @Param("checkIn") LocalDate checkIn, 
//                     @Param("checkOut") LocalDate checkOut, @Param("expiresAt") LocalDateTime expiresAt, 
//                     @Param("token") String token, @Param("createdAt") LocalDateTime createdAt,
//                     @Param("finalPrice") BigDecimal finalPrice);

//     @Modifying                
//     @Query(value="""
//         select *
//         from roomHold rh
//         where rh.token = :token
//     """, nativeQuery=true)
//     List<RoomHold> findHoldByToken(String token);

//     @Modifying
//     @Query(value = "DELETE FROM roomHold h WHERE h.expiresAt < :now", nativeQuery=true)
//     int deleteExpired(@Param("now") LocalDateTime now);

//     @Modifying
//     @Query(value = "DELETE FROM RoomHold h WHERE h.token = :token", nativeQuery=true)
//     int deleteByToken(@Param("token") String token);
// }

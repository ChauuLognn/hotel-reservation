package modules.room.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import modules.reservation.dto.AvailableRoom;
import modules.room.entity.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer>{

    @Query(value = """
        SELECT
            r.id        AS roomId,
            rt.name     AS name,
            rt.capacity AS capacity,
            rt.basePrice AS basePrice
        FROM room r
        JOIN roomType rt ON r.typeId = rt.id
        WHERE (:roomTypeName IS NULL OR rt.name = :roomTypeName)
          AND (:minCapacity IS NULL OR rt.capacity >= :minCapacity)
          AND NOT EXISTS (
              SELECT 1
              FROM reservationRoom rr
              WHERE rr.roomId = r.id
                AND rr.checkInTime < :checkOut
                AND (rr.checkOutTime IS NULL OR rr.checkOutTime > :checkIn)
                AND (
                    SELECT h.newStatus
                    FROM reservationStatusHistory h
                    WHERE h.reservationRoomId = rr.id
                    ORDER BY h.updatedAt DESC, h.historySeq DESC
                    LIMIT 1
                    ) not in ('CHECK_OUT', 'CANCELLED')
          )
        ORDER BY r.id
        """, nativeQuery = true)
    List<AvailableRoom> findAvailableRooms(
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut,
        @Param("roomTypeName") String roomTypeName,
        @Param("minCapacity") Byte minCapacity
    );

    @Query(value = "SELECT * FROM room WHERE id = :id", nativeQuery = true)
    Optional<Room> findRoom(@Param("id") Integer id);

    @Query(value = "SELECT * FROM room", nativeQuery = true)
    List<Room> takeAll();

    @Modifying
    @Query(value = """
        INSERT INTO room (id, typeId, status)
        VALUES (:id, :typeId, :status)
        """, nativeQuery = true)
    void insertRoom(
        @Param("id") Integer id,
        @Param("typeId") Integer typeId,
        @Param("status") String status
    );

    @Modifying
    @Query(value = """
        UPDATE room
        SET typeId = :typeId,
            status = :status
        WHERE id = :id
        """, nativeQuery = true)
    void updateRoom(
        @Param("id") Integer id,
        @Param("typeId") Integer typeId,
        @Param("status") String status
    );

    @Modifying
    @Query(value = "DELETE FROM room WHERE id = :id", nativeQuery = true)
    void deleteRoom(@Param("id") Integer id);
}
package com.hotelreservation.reservation.service;

import com.hotelreservation.reservation.dto.ReservationRequests.ChangeStatusRequest;
import com.hotelreservation.reservation.dto.ReservationResponses.ReservationGuestResponse;
import java.time.LocalDateTime;

public interface ReservationStatusService {
    ReservationGuestResponse setCheckIn(String resRoomId, Integer guestId, LocalDateTime checkInAt);
    ReservationGuestResponse setCheckOut(String resRoomId, Integer guestId, LocalDateTime checkOutAt);
    void updateResRoomStatus(String resRoomId, ChangeStatusRequest req, Integer updatedByUserId);
    void updateReservationStatus(String resId, ChangeStatusRequest req, Integer updatedBy);
}

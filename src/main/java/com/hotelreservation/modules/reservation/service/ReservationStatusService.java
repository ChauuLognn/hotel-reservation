package com.hotelreservation.modules.reservation.service;

import com.hotelreservation.modules.reservation.dto.ReservationRequests.ChangeStatusRequest;
import com.hotelreservation.modules.reservation.dto.ReservationResponses.ReservationGuestResponse;
import com.hotelreservation.modules.reservation.dto.ReservationResponses.StatusHistoryResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservationStatusService {
    ReservationGuestResponse setCheckIn(String resRoomId, Integer guestId, LocalDateTime checkInAt);
    ReservationGuestResponse setCheckOut(String resRoomId, Integer guestId, LocalDateTime checkOutAt);
    void updateResRoomStatus(String resRoomId, ChangeStatusRequest req, Integer updatedByUserId);
    void updateReservationStatus(String resId, ChangeStatusRequest req, Integer updatedBy);
}

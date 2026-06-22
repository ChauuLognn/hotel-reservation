package com.hotelreservation.modules.reservation.service;

import com.hotelreservation.modules.reservation.dto.ReservationRequests.CreateReservationRequest;
import com.hotelreservation.modules.reservation.dto.ReservationResponses.InitialReservationResponse;
import com.hotelreservation.modules.reservation.dto.ReservationResponses.ReservationGuestResponse;
import com.hotelreservation.modules.hotelservice.dto.HotelserviceRequests.AddReservationServiceRequest;

public interface ReservationCommandService {
    InitialReservationResponse createReservationFromRequest(CreateReservationRequest req, Integer emp);
    void deleteResRoom(String resRoomId);
    ReservationGuestResponse createReservationGuest(String resRoomId, Integer guestId);
    void createReservationService(String resRoomId, AddReservationServiceRequest rq, Integer userId);
    void deleteReservationService(String id);
}

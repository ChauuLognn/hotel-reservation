package com.hotelreservation.reservation.service;

import com.hotelreservation.reservation.dto.ReservationRequests.*;
import com.hotelreservation.reservation.dto.ReservationResponses.*;
import com.hotelreservation.hotelservice.dto.HotelserviceRequests.AddReservationServiceRequest;
import com.hotelreservation.hotelservice.dto.HotelserviceResponses.ReservationServiceResponse;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservationService {
    ReservationResponse getByResId(String resId);
    List<ReservationResponse> getAllReservations();
    InitialReservationResponse createReservationFromRequest(CreateReservationRequest req, Integer emp);
    List<ReservationResponse> getAllResByGuestId(Integer guestId);
    ReservationResponse getLastResByGuestId(Integer guestId);
    List<ReservationRoomResponse> getResRoomByResId(String resId);
    ReservationRoomResponse getResRoomById(String resRoomId);
    List<ReservationGuestResponse> getResGuestByResRoom(String resRoomId);
    void deleteResRoom(String resRoomId);
    GuestStayResponse getStaysOfGuest(Integer guestId);
    List<ReservationGuestResponse> getGuestsByResRoomId(String resRoomId);
    ReservationGuestResponse createReservationGuest(String resRoomId, Integer guestId);
    ReservationGuestResponse setCheckIn(String resRoomId, Integer guestId, LocalDateTime checkInAt);
    ReservationGuestResponse setCheckOut(String resRoomId, Integer guestId, LocalDateTime checkOutAt);
    List<StatusHistoryResponse> getHistoryByReservation(String resId);
    List<StatusHistoryResponse> getHistoryByReservationRoom(String resRoomId);
    void updateResRoomStatus(String resRoomId, ChangeStatusRequest req, Integer updatedByUserId);
    void updateReservationStatus(String resId, ChangeStatusRequest req, Integer updatedBy);
    void createReservationService(String resRoomId, AddReservationServiceRequest rq, Integer userId);
    List<ReservationServiceResponse> getAllServicesOfResRoom(String resRoomId);
    void deleteReservationService(String id);
    ReservationFullDetailResponse getReservationFullDetail(String resId);
    List<ReservationResponse> getMyBookings();
}

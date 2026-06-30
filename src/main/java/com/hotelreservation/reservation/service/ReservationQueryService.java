package com.hotelreservation.reservation.service;

import com.hotelreservation.reservation.dto.ReservationResponses.*;
import com.hotelreservation.hotelservice.dto.HotelserviceResponses.ReservationServiceResponse;
import java.util.List;

public interface ReservationQueryService {
    ReservationResponse getByResId(String resId);
    List<ReservationResponse> getAllReservations();
    List<ReservationResponse> getAllResByGuestId(Integer guestId);
    ReservationResponse getLastResByGuestId(Integer guestId);
    List<ReservationRoomResponse> getResRoomByResId(String resId);
    ReservationRoomResponse getResRoomById(String resRoomId);
    List<ReservationGuestResponse> getResGuestByResRoom(String resRoomId);
    GuestStayResponse getStaysOfGuest(Integer guestId);
    List<ReservationGuestResponse> getGuestsByResRoomId(String resRoomId);
    List<StatusHistoryResponse> getHistoryByReservation(String resId);
    List<StatusHistoryResponse> getHistoryByReservationRoom(String resRoomId);
    List<ReservationServiceResponse> getAllServicesOfResRoom(String resRoomId);
    ReservationFullDetailResponse getReservationFullDetail(String resId);
    List<ReservationResponse> getMyBookings();
}

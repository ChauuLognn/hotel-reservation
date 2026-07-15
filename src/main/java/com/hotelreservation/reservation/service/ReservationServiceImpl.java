package com.hotelreservation.reservation.service;

import com.hotelreservation.reservation.dto.ReservationRequests.*;
import com.hotelreservation.reservation.dto.ReservationResponses.*;
import com.hotelreservation.reservation.service.*;
import com.hotelreservation.hotelservice.dto.HotelserviceRequests.AddReservationServiceRequest;
import com.hotelreservation.hotelservice.dto.HotelserviceResponses.ReservationServiceResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ReservationServiceImpl implements ReservationService {

    @Autowired private ReservationQueryService queryService;
    @Autowired private ReservationCommandService commandService;
    @Autowired private ReservationStatusService statusService;

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getByResId(String resId) {
        return queryService.getByResId(resId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {
        return queryService.getAllReservations();
    }

    @Override
    public InitialReservationResponse createReservationFromRequest(CreateReservationRequest req, Integer emp) {
        return commandService.createReservationFromRequest(req, emp);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllResByGuestId(Integer guestId) {
        return queryService.getAllResByGuestId(guestId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getLastResByGuestId(Integer guestId) {
        return queryService.getLastResByGuestId(guestId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReservationRoomResponse> getResRoomByResId(String resId) {
        return queryService.getResRoomByResId(resId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationRoomResponse getResRoomById(String resRoomId) {
        return queryService.getResRoomById(resRoomId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationGuestResponse> getResGuestByResRoom(String resRoomId) {
        return queryService.getResGuestByResRoom(resRoomId);
    }

    @Override
    public void deleteResRoom(String resRoomId) {
        commandService.deleteResRoom(resRoomId);
    }

    @Override
    @Transactional(readOnly = true)
    public GuestStayResponse getStaysOfGuest(Integer guestId) {
        return queryService.getStaysOfGuest(guestId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationGuestResponse> getGuestsByResRoomId(String resRoomId) {
        return queryService.getGuestsByResRoomId(resRoomId);
    }

    @Override
    public ReservationGuestResponse createReservationGuest(String resRoomId, Integer guestId) {     
        return commandService.createReservationGuest(resRoomId, guestId);
    }

    @Override
    public ReservationGuestResponse setCheckIn(String resRoomId, Integer guestId, LocalDateTime checkInAt) {
        return statusService.setCheckIn(resRoomId, guestId, checkInAt);
    }

    @Override
    public ReservationGuestResponse setCheckOut(String resRoomId, Integer guestId, LocalDateTime checkOutAt) {
        return statusService.setCheckOut(resRoomId, guestId, checkOutAt);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getHistoryByReservation(String resId) {
        return queryService.getHistoryByReservation(resId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getHistoryByReservationRoom(String resRoomId) {
        return queryService.getHistoryByReservationRoom(resRoomId);
    }

    @Override
    public void updateResRoomStatus(String resRoomId, ChangeStatusRequest req, Integer updatedByUserId) {
        statusService.updateResRoomStatus(resRoomId, req, updatedByUserId);
    }

    @Override
    public void updateReservationStatus(String resId, ChangeStatusRequest req, Integer updatedBy) {
        statusService.updateReservationStatus(resId, req, updatedBy);
    }

    @Override
    public void createReservationService(String resRoomId, AddReservationServiceRequest rq, Integer userId) {
        commandService.createReservationService(resRoomId, rq, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationServiceResponse> getAllServicesOfResRoom(String resRoomId) {
        return queryService.getAllServicesOfResRoom(resRoomId);
    }

    @Override
    public void deleteReservationService(String id) {
        commandService.deleteReservationService(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationFullDetailResponse getReservationFullDetail(String resId) {
        return queryService.getReservationFullDetail(resId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyBookings() {
        return queryService.getMyBookings();
    }
}

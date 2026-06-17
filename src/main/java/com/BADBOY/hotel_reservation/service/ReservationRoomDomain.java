package com.BADBOY.hotel_reservation.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.BADBOY.hotel_reservation.dto.ReservationGuest.ReservationGuestDto;
import com.BADBOY.hotel_reservation.dto.ReservationRoom.ReservationRoomDto;
import com.BADBOY.hotel_reservation.entity.ReservationRoom;
import com.BADBOY.hotel_reservation.entity.reservation_guest.ReservationGuest;
import com.BADBOY.hotel_reservation.repository.ReservationGuestRepository;
import com.BADBOY.hotel_reservation.repository.ReservationRoomRepository;

@Service
public class ReservationRoomDomain {
    @Autowired private ReservationRoomRepository resRoomRepo;
    @Autowired private ReservationGuestRepository resGuestRepo;

    // lấy thông tin resRoom bằng id
    public ReservationRoomDto getResRoomById(String resRoomId){
        ReservationRoom rr = resRoomRepo.getByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found"));
        return ReservationRoomDto.fromEntity(rr);
    }

    // lấy các bản ghi lưu trú của khách trong resRoom
    @Transactional(readOnly=true)
    public List<ReservationGuestDto> getResGuestByResRoom(String resRoomId){
        List<ReservationGuest> lst = resGuestRepo.findByIdReservationRoomId(resRoomId);
        return lst.stream().map(ReservationGuestDto::fromEntity).collect(Collectors.toList());
    }

    // xóa resRoom bằng id
    public void delete(String resRoomId){
        if(!resRoomRepo.existsById(resRoomId))
            throw new IllegalArgumentException("ReservationRoom not found: " + resRoomId);
        resRoomRepo.deleteById(resRoomId);
    }

}

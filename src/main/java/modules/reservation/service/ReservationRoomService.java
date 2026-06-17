package modules.reservation.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import modules.reservation.dto.ReservationGuestDto;
import modules.reservation.dto.ReservationRoomDto;
import modules.reservation.entity.ReservationRoom;
import modules.reservation.entity.ReservationGuest;
import modules.reservation.repository.ReservationGuestRepository;
import modules.reservation.repository.ReservationRoomRepository;

@Service
public class ReservationRoomService {
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
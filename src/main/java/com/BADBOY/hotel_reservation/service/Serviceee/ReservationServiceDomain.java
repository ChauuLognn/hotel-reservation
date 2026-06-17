package com.BADBOY.hotel_reservation.service.Serviceee;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.BADBOY.hotel_reservation.dto.Service.ReservationServiceCreationRequest;
import com.BADBOY.hotel_reservation.dto.Service.ReservationServiceDto;
import com.BADBOY.hotel_reservation.repository.BillRepository;
import com.BADBOY.hotel_reservation.repository.Service.ReservationServiceRepository;
import com.BADBOY.hotel_reservation.repository.Service.ServiceRepository;

@Service
public class ReservationServiceDomain {
    @Autowired ReservationServiceRepository rSRepo;
    @Autowired ServiceRepository serRepo;
    @Autowired BillRepository billRepo;

    public void create(String resRoomId, 
        ReservationServiceCreationRequest rq,Integer userId
    ){
        if(billRepo.getByResRoomId(resRoomId).size() > 1)
            throw new IllegalStateException("cant serve this room for some reason");

        com.BADBOY.hotel_reservation.entity.Service ser = serRepo.findByName(rq.getName())
                .orElseThrow(() -> new IllegalArgumentException("Service not found"));
        
        BigDecimal totalAmount = ser.getPrice().multiply(BigDecimal.valueOf(rq.getQuantity()));
        
        String id = UUID.randomUUID().toString();

        rSRepo.insertResService(id, resRoomId, ser.getId(),
            rq.getQuantity(), totalAmount, LocalDateTime.now(), userId);
    }

    public List<ReservationServiceDto> getAllOfResRoom(String resRoomId){
        return rSRepo.getByResRoomId(resRoomId).stream()
            .map(ReservationServiceDto::fromEntity).collect(Collectors.toList());
    }

    public void delete(String id){
        if(!rSRepo.existsById(id))
            throw new IllegalArgumentException("Theres no reservationService to delete");
        rSRepo.delete(id);
    }
}

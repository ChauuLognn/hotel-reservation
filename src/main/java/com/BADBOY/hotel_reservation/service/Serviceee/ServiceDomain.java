package com.BADBOY.hotel_reservation.service.Serviceee;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.BADBOY.hotel_reservation.dto.Service.serviceCreationRequest;
import com.BADBOY.hotel_reservation.repository.Service.ServiceRepository;

@Service
public class ServiceDomain {
    @Autowired ServiceRepository serRepo;

    @Transactional
    public com.BADBOY.hotel_reservation.entity.Service create(serviceCreationRequest rq){
        serRepo.insertService(rq.getName(), rq.getPrice());
        com.BADBOY.hotel_reservation.entity.Service s = serRepo.findByName(rq.getName()).
            orElseThrow(() -> new IllegalArgumentException("Service not found"));
        return s;
    }

    public com.BADBOY.hotel_reservation.entity.Service getByName(String name){
        return serRepo.findByName(name).
            orElseThrow(() -> new IllegalArgumentException("Service not found"));
    }

    public List<com.BADBOY.hotel_reservation.entity.Service> getAllService(){
        return serRepo.takeAll();
    }

    @Transactional
    public com.BADBOY.hotel_reservation.entity.Service update(String name, serviceCreationRequest rq){
        com.BADBOY.hotel_reservation.entity.Service s = serRepo.findByName(rq.getName()).
            orElseThrow(() -> new IllegalArgumentException("Service not found"));
        serRepo.updateService(name, rq.getPrice(), rq.getStatus());
        return s;
    }

    @Transactional
    public void delete(String name){
        serRepo.deleteSer(name);
    }
}

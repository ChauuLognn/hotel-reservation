package com.hotelreservation.modules.hotelservice.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;

import com.hotelreservation.modules.hotelservice.dto.HotelserviceRequests.*;
import com.hotelreservation.modules.hotelservice.dto.HotelserviceResponses.*;
import com.hotelreservation.modules.hotelservice.service.HotelServiceManager;

@RestController
@RequestMapping("/api/services")
public class HotelServiceController {
    @Autowired private HotelServiceManager serDomain;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public HotelServiceResponse createService(@RequestBody @Valid CreateServiceRequest rq){
        return serDomain.create(rq);
    }

    @GetMapping
    public List<HotelServiceResponse> takeAllService(){
        return serDomain.getAllService();
    }

    @GetMapping("/{name}")
    public HotelServiceResponse getServiceByName(@PathVariable String name){
        return serDomain.getByName(name);
    }

    @PutMapping("/{name}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public HotelServiceResponse updateService(@PathVariable String name,
                    @RequestBody @Valid UpdateServiceRequest rq){
        return serDomain.update(name, rq);
    }

    @DeleteMapping("/{name}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public String deleteService(@PathVariable String name){
        serDomain.delete(name);
        return "HotelService deleted successfully";
    }
}

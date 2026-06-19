package com.hotelreservation.module.hotelservice.controller;

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

import com.hotelreservation.module.hotelservice.dto.request.CreateServiceRequest;
import com.hotelreservation.module.hotelservice.dto.request.UpdateServiceRequest;
import com.hotelreservation.module.hotelservice.dto.response.HotelServiceResponse;
import com.hotelreservation.module.hotelservice.service.HotelServiceManager;

@RestController
@RequestMapping("/api/services")
public class HotelServiceController {
    @Autowired private HotelServiceManager serDomain;

    @PostMapping
    public HotelServiceResponse createService(@RequestBody CreateServiceRequest rq){
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
    public HotelServiceResponse updateService(@PathVariable String name,
                    @RequestBody UpdateServiceRequest rq){
        return serDomain.update(name, rq);
    }

    @DeleteMapping("/{name}")
    public String deleteService(@PathVariable String name){
        serDomain.delete(name);
        return "HotelService deleted successfully";
    }
}

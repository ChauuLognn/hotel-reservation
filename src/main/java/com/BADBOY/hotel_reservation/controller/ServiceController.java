package com.BADBOY.hotel_reservation.controller;

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

import com.BADBOY.hotel_reservation.dto.Service.serviceCreationRequest;
import com.BADBOY.hotel_reservation.entity.Service;
import com.BADBOY.hotel_reservation.service.Serviceee.ServiceDomain;


@RestController
@RequestMapping("/api/services")
public class ServiceController {
    @Autowired ServiceDomain serDomain;


    // tạo dịch vụ mới
    @PostMapping
    public Service createService(@RequestBody serviceCreationRequest rq){
        return serDomain.create(rq);
    }

    // lấy ra mọi dịch vụ của khách sạn
    @GetMapping
    public List<Service> takeAllService(){
        return serDomain.getAllService();
    }

    // lấy ra thông tin của dịch vụ theo tên
    @GetMapping("/{name}")
    public Service getServiceByName(@PathVariable String name){
        return serDomain.getByName(name);
    }

    // cập nhật thông tin dịch vụ theo tên
    @PutMapping("/{name}")
    public Service updateService(@PathVariable String name,
                    @RequestBody serviceCreationRequest rq){
        return serDomain.update(name, rq);
    }

    // xóa dịch vụ theo tên
    @DeleteMapping("/{name}")
    public String deleteService(@PathVariable String name){
        serDomain.delete(name);
        return "Service deleted successfully";
    }
}

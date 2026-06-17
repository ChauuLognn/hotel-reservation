package com.BADBOY.hotel_reservation.controller.Person;

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

import com.BADBOY.hotel_reservation.dto.Person.EmpCreationRequest;
import com.BADBOY.hotel_reservation.dto.Person.EmpDto;
import com.BADBOY.hotel_reservation.service.Person.EmpDomain;

@RestController
@RequestMapping("/api/emps")
public class EmpController {
    @Autowired private EmpDomain eDomain;

    @PostMapping
    public EmpDto create(@RequestBody EmpCreationRequest rq){
        return eDomain.create(rq);
    }

    @GetMapping
    public List<EmpDto> getAll(){
        return eDomain.getAll();
    }

    @GetMapping("/{id}")
    public EmpDto getById(@PathVariable Integer id){
        return eDomain.getById(id);
    }

    @PutMapping("/{id}")
    public EmpDto update(@PathVariable Integer id, @RequestBody EmpCreationRequest rq){
        return eDomain.update(id, rq);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id){
        eDomain.delete(id);
        return "Deleted emp successfully";
    }
}

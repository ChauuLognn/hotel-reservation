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

import com.BADBOY.hotel_reservation.dto.Person.UserCreationRequest;
import com.BADBOY.hotel_reservation.dto.Person.UserDto;
import com.BADBOY.hotel_reservation.service.Person.UserDomain;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserDomain userDomain;

    @PostMapping
    public UserDto create(@RequestBody UserCreationRequest rq){
        return userDomain.create(rq);
    }

    @GetMapping
    public List<UserDto> getAll(){
        return userDomain.getAll();
    }

    @GetMapping("/{id}")
    public UserDto getById(@PathVariable Integer id){
        return userDomain.getById(id);
    }

    @PutMapping("/{id}")
    public UserDto update(@PathVariable Integer id, @RequestBody UserCreationRequest rq){
        return userDomain.update(id, rq);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Integer id){
        userDomain.delete(id);
        return "Deleted user successfully";
    }
}

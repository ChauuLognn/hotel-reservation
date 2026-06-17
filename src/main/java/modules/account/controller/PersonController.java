package modules.account.controller;
import modules.account.entity.Guest;
import modules.account.entity.User;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import modules.account.dto.EmpCreationRequest;
import modules.account.dto.EmpDto;
import modules.account.dto.GuestCreationRequest;
import modules.account.dto.GuestDto;
import modules.account.dto.UserCreationRequest;
import modules.account.dto.UserDto;
import modules.reservation.dto.GuestStayDto;
import modules.account.service.EmpDomain;
import modules.account.service.GuestDomain;
import modules.account.service.UserDomain;
import modules.reservation.service.ReservationGuestDomain;

@RestController
public class PersonController {

    @Autowired private EmpDomain eDomain;
    @Autowired private GuestDomain gDomain;
    @Autowired private UserDomain userDomain;
    @Autowired private ReservationGuestDomain resGuestDomain;

    // ─── Employee ─────────────────────────────────────────────────────────────

    @PostMapping("/api/emps")
    public EmpDto createEmp(@RequestBody EmpCreationRequest rq) {
        return eDomain.create(rq);
    }

    @GetMapping("/api/emps")
    public List<EmpDto> getAllEmps() {
        return eDomain.getAll();
    }

    @GetMapping("/api/emps/{id}")
    public EmpDto getEmpById(@PathVariable Integer id) {
        return eDomain.getById(id);
    }

    @PutMapping("/api/emps/{id}")
    public EmpDto updateEmp(@PathVariable Integer id, @RequestBody EmpCreationRequest rq) {
        return eDomain.update(id, rq);
    }

    @DeleteMapping("/api/emps/{id}")
    public String deleteEmp(@PathVariable Integer id) {
        eDomain.delete(id);
        return "Deleted emp successfully";
    }

    // ─── Guest ────────────────────────────────────────────────────────────────

    @PostMapping("/api/guests")
    public GuestDto createGuest(@RequestBody GuestCreationRequest rq) {
        return gDomain.create(rq);
    }

    @GetMapping("/api/guests")
    public List<GuestDto> getAllGuests() {
        return gDomain.getAll();
    }

    @GetMapping("/api/guests/{id}")
    public GuestDto getGuestById(@PathVariable Integer id) {
        return gDomain.getById(id);
    }

    @PutMapping("/api/guests/{id}")
    public GuestDto updateGuest(@PathVariable Integer id, @RequestBody GuestCreationRequest rq) {
        return gDomain.update(id, rq);
    }

    @DeleteMapping("/api/guests/{id}")
    public String deleteGuest(@PathVariable Integer id) {
        gDomain.delete(id);
        return "Deleted guest successfully";
    }

    @GetMapping("/api/guests/{guestId}/stays")
    public GuestStayDto getStaysOfGuest(@PathVariable Integer guestId) {
        return resGuestDomain.getStaysOfGuest(guestId);
    }

    // ─── User ─────────────────────────────────────────────────────────────────

    @PostMapping("/api/users")
    public UserDto createUser(@RequestBody UserCreationRequest rq) {
        return userDomain.create(rq);
    }

    @GetMapping("/api/users")
    public List<UserDto> getAllUsers() {
        return userDomain.getAll();
    }

    @GetMapping("/api/users/{id}")
    public UserDto getUserById(@PathVariable Integer id) {
        return userDomain.getById(id);
    }

    @PutMapping("/api/users/{id}")
    public UserDto updateUser(@PathVariable Integer id, @RequestBody UserCreationRequest rq) {
        return userDomain.update(id, rq);
    }

    @DeleteMapping("/api/users/{id}")
    public String deleteUser(@PathVariable Integer id) {
        userDomain.delete(id);
        return "Deleted user successfully";
    }
}
package com.hotelreservation.modules.account.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.hotelreservation.modules.account.dto.AccountRequests.EmpCreateRequest;
import com.hotelreservation.modules.account.dto.AccountResponses.EmpResponse;
import com.hotelreservation.modules.account.service.EmpService;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/emps")
public class EmployeeController {

    @Autowired 
    private EmpService eDomain;

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public EmpResponse createEmp(@RequestBody @Valid EmpCreateRequest rq) {
        return eDomain.create(rq);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public List<EmpResponse> getAllEmps() {
        return eDomain.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
    public EmpResponse getEmpById(@PathVariable Integer id) {
        return eDomain.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public EmpResponse updateEmp(@PathVariable Integer id, @RequestBody @Valid EmpCreateRequest rq) {
        return eDomain.update(id, rq);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    public String deleteEmp(@PathVariable Integer id) {
        eDomain.delete(id);
        return "Deleted emp successfully";
    }
}

package com.hotelreservation.module.account.service.impl;
// Enterprise implementation of EmpService

import com.hotelreservation.module.account.dto.request.EmpCreateRequest;
import com.hotelreservation.module.account.dto.response.EmpResponse;
import com.hotelreservation.module.account.entity.Emp;
import com.hotelreservation.module.account.mapper.EmpMapper;
import com.hotelreservation.module.account.repository.EmpRepository;
import com.hotelreservation.module.account.repository.UserRepository;
import com.hotelreservation.module.account.service.EmpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmpServiceImpl implements EmpService {
    @Autowired private EmpRepository empRepo;
    @Autowired private UserRepository userRepo;

    @Override
    public EmpResponse create(EmpCreateRequest rq) {
        validateUniqueFields(null, rq);

        empRepo.insertEmp(rq.getFirstName(), rq.getLastName(),
                        rq.getDateOfBirth(), rq.getIdentityNum(),
                        rq.getEmail(), rq.getPhone(),
                        rq.getAddress(), rq.getRole());

        Emp e = empRepo.findEmpByIdentityNum(rq.getIdentityNum())
            .orElseThrow(() -> new IllegalStateException("Cannot load Emp after insert"));

        return EmpMapper.toResponse(e);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpResponse> getAll() {
        return empRepo.takeAll()
            .stream()
            .map(EmpMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmpResponse getById(Integer id) {
        Emp e = empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + id));
        return EmpMapper.toResponse(e);
    }

    @Override
    public EmpResponse update(Integer id, EmpCreateRequest rq) {
        empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + id));

        validateUniqueFields(id, rq);

        empRepo.updateEmp(
            id, rq.getFirstName(), rq.getLastName(),
            rq.getDateOfBirth(), rq.getIdentityNum(),
            rq.getEmail(), rq.getPhone(),
            rq.getAddress(), rq.getRole());

        Emp updated = empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalStateException("Cannot load Emp after update"));

        return EmpMapper.toResponse(updated);
    }

    @Override
    public void delete(Integer id) {
        empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + id));

        userRepo.unlinkEmpFromUsers(id);

        empRepo.deleteEmp(id);
    }

    private void validateUniqueFields(Integer id, EmpCreateRequest rq) {
        int safeId = id == null ? -1 : id;

        if (empRepo.countByIdentityNumUsedByOtherEmp(rq.getIdentityNum(), safeId) > 0) {
            throw new IllegalArgumentException("CMND/CCCD đã được sử dụng bởi nhân viên khác");
        }
        if (empRepo.countByEmailUsedByOtherEmp(rq.getEmail(), safeId) > 0) {
            throw new IllegalArgumentException("Email đã được sử dụng bởi nhân viên khác");
        }
        if (empRepo.countByPhoneUsedByOtherEmp(rq.getPhone(), safeId) > 0) {
            throw new IllegalArgumentException("Số điện thoại đã được sử dụng bởi nhân viên khác");
        }
    }
}

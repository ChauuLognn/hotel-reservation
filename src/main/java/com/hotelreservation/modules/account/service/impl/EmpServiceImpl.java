package com.hotelreservation.modules.account.service.impl;
// Enterprise implementation of EmpService

import com.hotelreservation.modules.account.dto.AccountRequests.EmpCreateRequest;
import com.hotelreservation.modules.account.dto.AccountResponses.EmpResponse;
import com.hotelreservation.modules.account.entity.Emp;
import com.hotelreservation.modules.account.mapper.AccountMapper;
import com.hotelreservation.modules.account.repository.EmpRepository;
import com.hotelreservation.modules.account.repository.UserRepository;
import com.hotelreservation.modules.account.service.EmpService;
import com.hotelreservation.modules.account.entity.Role;
import com.hotelreservation.modules.account.repository.RoleRepository;
import com.hotelreservation.common.enums.RoleName;
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
    @Autowired private RoleRepository roleRepo;

    @Override
    public EmpResponse create(EmpCreateRequest rq) {
        validateUniqueFields(null, rq);

        Emp e = new Emp();
        e.setFirstName(rq.getFirstName());
        e.setLastName(rq.getLastName());
        e.setDateOfBirth(rq.getDateOfBirth());
        e.setIdentityNum(rq.getIdentityNum());
        e.setEmail(rq.getEmail());
        e.setPhone(rq.getPhone());
        e.setAddress(rq.getAddress());
        
        Role role = resolveRole(rq);
        e.setRole(role);

        e = empRepo.save(e);

        return AccountMapper.toResponse(e);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpResponse> getAll() {
        return empRepo.takeAll()
            .stream()
            .map(AccountMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmpResponse getById(Integer id) {
        Emp e = empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + id));
        return AccountMapper.toResponse(e);
    }

    @Override
    public EmpResponse update(Integer id, EmpCreateRequest rq) {
        Emp e = empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + id));

        if ("system@hotelhaven.com".equals(e.getEmail())) {
            throw new IllegalArgumentException("Không thể cập nhật thông tin nhân sự của tài khoản hệ thống 'system'.");
        }

        validateUniqueFields(id, rq);

        e.setFirstName(rq.getFirstName());
        e.setLastName(rq.getLastName());
        e.setDateOfBirth(rq.getDateOfBirth());
        e.setIdentityNum(rq.getIdentityNum());
        e.setEmail(rq.getEmail());
        e.setPhone(rq.getPhone());
        e.setAddress(rq.getAddress());
        
        Role role = resolveRole(rq);
        e.setRole(role);

        e = empRepo.save(e);

        return AccountMapper.toResponse(e);
    }

    @Override
    public void delete(Integer id) {
        Emp e = empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + id));

        if ("system@hotelhaven.com".equals(e.getEmail())) {
            throw new IllegalArgumentException("Không thể xóa thông tin nhân sự của tài khoản hệ thống 'system'.");
        }

        userRepo.unlinkEmpFromUsers(id);
        userRepo.flush();

        empRepo.delete(e);
    }

    private void validateUniqueFields(Integer id, EmpCreateRequest rq) {
        int safeId = id == null ? -1 : id;

        if ("system@hotelhaven.com".equals(rq.getEmail())) {
            if (id == null) {
                throw new IllegalArgumentException("Không thể sử dụng email hệ thống 'system@hotelhaven.com'.");
            }
            Emp existing = empRepo.findEmpById(id).orElse(null);
            if (existing == null || !"system@hotelhaven.com".equals(existing.getEmail())) {
                throw new IllegalArgumentException("Không thể sử dụng email hệ thống 'system@hotelhaven.com'.");
            }
        }

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

    private Role resolveRole(EmpCreateRequest rq) {
        if (rq.getRoleName() != null && !rq.getRoleName().isBlank()) {
            RoleName roleName;
            try {
                roleName = RoleName.valueOf(rq.getRoleName().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Role not found: " + rq.getRoleName());
            }
            return roleRepo.findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + rq.getRoleName()));
        }
        return roleRepo.findById(rq.getRole())
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + rq.getRole()));
    }
}

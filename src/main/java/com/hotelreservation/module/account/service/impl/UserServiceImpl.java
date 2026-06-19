package com.hotelreservation.module.account.service.impl;

import com.hotelreservation.module.account.dto.request.UserCreateRequest;
import com.hotelreservation.module.account.dto.response.UserResponse;
import com.hotelreservation.module.account.entity.Emp;
import com.hotelreservation.module.account.entity.User;
import com.hotelreservation.module.account.mapper.UserMapper;
import com.hotelreservation.module.account.repository.EmpRepository;
import com.hotelreservation.module.account.repository.UserRepository;
import com.hotelreservation.module.account.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepo;
    @Autowired 
    private EmpRepository empRepo;

    @Override
    public UserResponse create(UserCreateRequest rq) {
        Emp emp = empRepo.findEmpById(rq.getEmpId())
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + rq.getEmpId()));

        userRepo.insertUser(emp.getId(),
            rq.getAccount(), rq.getPassword());

        User u = userRepo.findUserByEmpId(emp.getId())
            .orElseThrow(() -> new IllegalStateException("Cannot load User after insert"));

        return UserMapper.toResponse(u);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        return userRepo.takeAll().stream()
            .map(UserMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Integer id) {
        User u = userRepo.findUserById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return UserMapper.toResponse(u);
    }

    @Override
    public UserResponse update(Integer id, UserCreateRequest rq) {
        userRepo.findUserById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        userRepo.updateUser(
            id, rq.getAccount(), rq.getPassword()
        );

        User updated = userRepo.findUserById(id)
            .orElseThrow(() -> new IllegalStateException("Cannot load User after update"));

        return UserMapper.toResponse(updated);
    }

    @Override
    public void delete(Integer id) {
        userRepo.findUserById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        Long referenceCount = userRepo.countBusinessReferencesByUserId(id);
        if (referenceCount != null && referenceCount > 0) {
            throw new IllegalArgumentException(
                "Không thể xóa tài khoản này vì đã phát sinh đặt phòng, dịch vụ hoặc lịch sử trạng thái. " +
                "Hãy giữ tài khoản để bảo toàn lịch sử nghiệp vụ hoặc đặt lại mật khẩu nếu cần khóa quyền truy cập."
            );
        }

        userRepo.deleteUser(id);
    }
}

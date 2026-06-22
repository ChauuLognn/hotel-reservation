package com.hotelreservation.modules.account.service.impl;

import com.hotelreservation.modules.account.dto.AccountRequests.UserCreateRequest;
import com.hotelreservation.modules.account.dto.AccountResponses.UserResponse;
import com.hotelreservation.modules.account.entity.Emp;
import com.hotelreservation.modules.account.entity.User;
import com.hotelreservation.modules.account.mapper.AccountMapper;
import com.hotelreservation.modules.account.repository.EmpRepository;
import com.hotelreservation.modules.account.repository.UserRepository;
import com.hotelreservation.modules.account.service.UserService;
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

        return AccountMapper.toResponse(u);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        return userRepo.takeAll().stream()
            .map(AccountMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Integer id) {
        User u = userRepo.findUserById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return AccountMapper.toResponse(u);
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

        return AccountMapper.toResponse(updated);
    }

    @Override
    public void delete(Integer id) {
        User userToDelete = userRepo.findUserById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        if ("system".equals(userToDelete.getAccount())) {
            throw new IllegalArgumentException("Không thể xóa tài khoản hệ thống 'system'.");
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName().equals(userToDelete.getAccount())) {
            throw new IllegalArgumentException("Bạn không thể tự xóa tài khoản của chính mình.");
        }

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

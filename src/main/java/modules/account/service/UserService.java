package modules.account.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import modules.account.dto.UserPayload.UserCreationRequest;
import modules.account.dto.UserPayload.UserDto;
import modules.account.entity.Emp;
import modules.account.entity.User;
import modules.account.repository.EmpRepository;
import modules.account.repository.UserRepository;

@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepo;
    @Autowired 
    private EmpRepository empRepo;

    public UserDto create(UserCreationRequest rq) {
        Emp emp = empRepo.findEmpById(rq.getEmpId())
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + rq.getEmpId()));

        userRepo.insertUser(emp.getId(),
            rq.getAccount(),rq.getPassword());

        User u = userRepo.findUserByEmpId(emp.getId())
            .orElseThrow(() -> new IllegalStateException("Cannot load User after insert"));

        return UserDto.fromEntity(u);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAll() {
        return userRepo.takeAll().stream()
            .map(UserDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getById(Integer id) {
        User u = userRepo.findUserById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return UserDto.fromEntity(u);
    }

    public UserDto update(Integer id, UserCreationRequest rq) {
        userRepo.findUserById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        userRepo.updateUser(
            id,rq.getAccount(),rq.getPassword()
        );

        User updated = userRepo.findUserById(id)
            .orElseThrow(() -> new IllegalStateException("Cannot load User after update"));

        return UserDto.fromEntity(updated);
    }

    public void delete(Integer id) {
        userRepo.findUserById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        userRepo.deleteUser(id);
    }
}
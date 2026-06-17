package modules.account.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import modules.account.dto.EmpCreationRequest;
import modules.account.dto.EmpDto;
import modules.account.entity.Emp;
import modules.account.repository.EmpRepository;

@Service
@Transactional
public class EmpService {
    @Autowired private EmpRepository empRepo;

    public EmpDto create(EmpCreationRequest rq) {
        empRepo.insertEmp(rq.getFirstName(),rq.getLastName(),
                        rq.getDateOfBirth(),rq.getIdentityNum(),
                        rq.getEmail(),rq.getPhone(),
                        rq.getAddress(),rq.getRole());

        Emp e = empRepo.findEmpByIdentityNum(rq.getIdentityNum())
            .orElseThrow(() -> new IllegalStateException("Cannot load Emp after insert"));

        return EmpDto.fromEntity(e);
    }

    @Transactional(readOnly = true)
    public List<EmpDto> getAll() {
        return empRepo.takeAll()
            .stream()
            .map(EmpDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmpDto getById(Integer id) {
        Emp e = empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + id));
        return EmpDto.fromEntity(e);
    }

    public EmpDto update(Integer id, EmpCreationRequest rq) {
        empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + id));

        empRepo.updateEmp(
            id,rq.getFirstName(),rq.getLastName(),
            rq.getDateOfBirth(),rq.getIdentityNum(),
            rq.getEmail(),rq.getPhone(),
            rq.getAddress(),rq.getRole());

        Emp updated = empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalStateException("Cannot load Emp after update"));

        return EmpDto.fromEntity(updated);
    }

    public void delete(Integer id) {
        empRepo.findEmpById(id)
            .orElseThrow(() -> new IllegalArgumentException("Emp not found: " + id));
        empRepo.deleteEmp(id);
    }
}
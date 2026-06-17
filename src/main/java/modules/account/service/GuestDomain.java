package modules.account.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import modules.account.dto.GuestCreationRequest;
import modules.account.dto.GuestDto;
import modules.account.entity.Guest;
import modules.account.repository.GuestRepository;

@Service
@Transactional
public class GuestDomain {
    @Autowired private GuestRepository gRepo;

    public GuestDto create(GuestCreationRequest rq) {
        gRepo.insertGuest(
            rq.getFirstName(), rq.getLastName(),rq.getIdentityNum(),
            rq.getPhone(),rq.getDateOfBirth());

        Guest g = gRepo.findGuestByIdentityNum(rq.getIdentityNum())
            .orElseThrow(() -> new IllegalStateException("Cannot load Guest after insert"));

        return GuestDto.fromEntity(g);
    }

    @Transactional(readOnly = true)
    public List<GuestDto> getAll() {
        return gRepo.takeAll()
            .stream()
            .map(GuestDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GuestDto getById(Integer id) {
        Guest g = gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalArgumentException("Guest not found: " + id));
        return GuestDto.fromEntity(g);
    }

    public GuestDto update(Integer id, GuestCreationRequest rq) {
        gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalArgumentException("Guest not found: " + id));

        gRepo.updateGuest(
            id,rq.getFirstName(),rq.getLastName(),
            rq.getIdentityNum(),rq.getPhone(),
            rq.getDateOfBirth());

        Guest updated = gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalStateException("Cannot load Guest after update"));

        return GuestDto.fromEntity(updated);
    }

    public void delete(Integer id) {
        gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalArgumentException("Guest not found: " + id));
        gRepo.deleteGuest(id);
    }
}
package com.hotelreservation.modules.account.service.impl;

import com.hotelreservation.modules.account.dto.AccountRequests.GuestCreateRequest;
import com.hotelreservation.modules.account.dto.AccountResponses.GuestResponse;
import com.hotelreservation.modules.account.entity.Guest;
import com.hotelreservation.modules.account.mapper.AccountMapper;
import com.hotelreservation.modules.account.repository.GuestRepository;
import com.hotelreservation.modules.account.service.GuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GuestServiceImpl implements GuestService {
    @Autowired private GuestRepository gRepo;

    @Override
    public GuestResponse create(GuestCreateRequest rq) {
        Guest g = new Guest();
        g.setFirstName(rq.getFirstName());
        g.setLastName(rq.getLastName());
        g.setIdentityNum(rq.getIdentityNum());
        g.setPhone(rq.getPhone());
        g.setDateOfBirth(rq.getDateOfBirth());

        g = gRepo.save(g);

        return AccountMapper.toResponse(g);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestResponse> getAll() {
        return gRepo.takeAll()
            .stream()
            .map(AccountMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GuestResponse getById(Integer id) {
        Guest g = gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalArgumentException("Guest not found: " + id));
        return AccountMapper.toResponse(g);
    }

    @Override
    public GuestResponse update(Integer id, GuestCreateRequest rq) {
        Guest g = gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalArgumentException("Guest not found: " + id));

        g.setFirstName(rq.getFirstName());
        g.setLastName(rq.getLastName());
        g.setIdentityNum(rq.getIdentityNum());
        g.setPhone(rq.getPhone());
        g.setDateOfBirth(rq.getDateOfBirth());

        g = gRepo.save(g);

        return AccountMapper.toResponse(g);
    }

    @Override
    public void delete(Integer id) {
        Guest g = gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalArgumentException("Guest not found: " + id));
        gRepo.delete(g);
    }
}

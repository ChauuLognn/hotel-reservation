package com.hotelreservation.module.account.service.impl;

import com.hotelreservation.module.account.dto.request.GuestCreateRequest;
import com.hotelreservation.module.account.dto.response.GuestResponse;
import com.hotelreservation.module.account.entity.Guest;
import com.hotelreservation.module.account.mapper.GuestMapper;
import com.hotelreservation.module.account.repository.GuestRepository;
import com.hotelreservation.module.account.service.GuestService;
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

        return GuestMapper.toResponse(g);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestResponse> getAll() {
        return gRepo.takeAll()
            .stream()
            .map(GuestMapper::toResponse)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GuestResponse getById(Integer id) {
        Guest g = gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalArgumentException("Guest not found: " + id));
        return GuestMapper.toResponse(g);
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

        return GuestMapper.toResponse(g);
    }

    @Override
    public void delete(Integer id) {
        Guest g = gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalArgumentException("Guest not found: " + id));
        gRepo.delete(g);
    }
}

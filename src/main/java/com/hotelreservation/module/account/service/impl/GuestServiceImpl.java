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
        gRepo.insertGuest(
            rq.getFirstName(), rq.getLastName(), rq.getIdentityNum(),
            rq.getPhone(), rq.getDateOfBirth());

        Guest g = gRepo.findGuestByIdentityNum(rq.getIdentityNum())
            .orElseThrow(() -> new IllegalStateException("Cannot load Guest after insert"));

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
        gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalArgumentException("Guest not found: " + id));

        gRepo.updateGuest(
            id, rq.getFirstName(), rq.getLastName(),
            rq.getIdentityNum(), rq.getPhone(),
            rq.getDateOfBirth());

        Guest updated = gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalStateException("Cannot load Guest after update"));

        return GuestMapper.toResponse(updated);
    }

    @Override
    public void delete(Integer id) {
        gRepo.findGuestById(id)
            .orElseThrow(() -> new IllegalArgumentException("Guest not found: " + id));
        gRepo.deleteGuest(id);
    }
}

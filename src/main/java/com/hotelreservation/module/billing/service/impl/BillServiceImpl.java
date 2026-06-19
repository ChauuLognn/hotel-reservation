package com.hotelreservation.module.billing.service.impl;

import com.hotelreservation.module.billing.dto.response.BillResponse;
import com.hotelreservation.module.billing.dto.response.ResRoomBillResponse;
import com.hotelreservation.module.billing.dto.response.ReservationBillResponse;
import com.hotelreservation.module.billing.entity.Bill;
import com.hotelreservation.module.billing.mapper.BillMapper;
import com.hotelreservation.module.billing.repository.BillRepository;
import com.hotelreservation.module.billing.service.BillService;
import com.hotelreservation.module.reservation.dto.response.ReservationGuestResponse;
import com.hotelreservation.module.reservation.entity.Reservation;
import com.hotelreservation.module.reservation.entity.ReservationRoom;
import com.hotelreservation.module.reservation.mapper.ReservationMapper;
import com.hotelreservation.module.reservation.repository.ReservationGuestRepository;
import com.hotelreservation.module.reservation.repository.ReservationRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BillServiceImpl implements BillService {

    @Autowired private BillRepository billRepo;
    @Autowired private ReservationRoomRepository rrRepo;
    @Autowired private ReservationGuestRepository resGuestRepo;
    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional(readOnly = true)
    public List<BillResponse> getByResId(String resId) {
        List<Bill> bills = billRepo.getByResId(resId);
        return bills.stream().map(BillMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BillResponse> getByResRoomId(String resRoomId) {
        List<Bill> bills = billRepo.getByResRoomId(resRoomId);
        return bills.stream().map(BillMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void ConfirmedPaidBillsForResId(String resId) {
        billRepo.markBillsPaidForResId(resId);
    }

    @Override
    public void ConfirmedPaidBillsForResRoomId(String resRoomId) {
        billRepo.markBillsPaidForResRoomId(resRoomId);
    }

    @Override
    @Transactional(readOnly = true)
    public ResRoomBillResponse createResRoomBillSummary(String resRoomId) {
        List<Bill> items = billRepo.getByResRoomId(resRoomId);

        List<BillResponse> billDtos = items.stream()
                .map(BillMapper::toResponse)
                .collect(Collectors.toList());

        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal totalDue = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;

        for(BillResponse dto : billDtos){
            total = total.add(dto.getTotalAmount());
            if(dto.getStatus().equals("PAID"))  
                totalPaid = totalPaid.add(dto.getTotalAmount());
            else
                totalDue = totalDue.add(dto.getTotalAmount());
        }

        ReservationRoom rr = rrRepo.getByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));
        
        List<ReservationGuestResponse> guests = resGuestRepo.findByIdReservationRoomId(resRoomId)
            .stream()
            .map(ReservationMapper::toGuestResponse)
            .collect(Collectors.toList());
        
        ResRoomBillResponse summary = new ResRoomBillResponse();
        summary.setRoomId(rr.getRoom().getId());
        summary.setResRoomId(resRoomId);
        summary.setCheckInTime(rr.getCheckInTime());
        summary.setCheckOutTime(rr.getCheckOutTime());
        summary.setRoomBills(billDtos);
        summary.setGuests(guests);
        summary.setTotal(total);
        summary.setTotalPaid(totalPaid);
        summary.setTotalDue(totalDue);

        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationBillResponse createReservationBillSummary(String resId) {
        jakarta.persistence.Query query = em.createQuery(
            "SELECT r FROM Reservation r " +
            "LEFT JOIN FETCH r.guest " +
            "WHERE r.id = :resId",
            Reservation.class
        );
        query.setParameter("resId", resId);
        
        Reservation res = (Reservation) query.getSingleResult();
        if (res == null) {
            throw new IllegalArgumentException("Reservation not found: " + resId);
        }
        
        List<ReservationRoom> rrs = rrRepo.findByReservationId(resId);

        List<ResRoomBillResponse> lst = new ArrayList<>();

        LocalDate earliestCheckIn = null;
        LocalDate latestCheckOut = null;

        for(ReservationRoom rr : rrs){
            ResRoomBillResponse x = createResRoomBillSummary(rr.getId());
            lst.add(x);
            
            if(earliestCheckIn == null || rr.getCheckInTime().isBefore(earliestCheckIn)) {
                earliestCheckIn = rr.getCheckInTime();
            }
            if(latestCheckOut == null || rr.getCheckOutTime().isAfter(latestCheckOut)) {
                latestCheckOut = rr.getCheckOutTime();
            }
        }

        ReservationBillResponse summary = new ReservationBillResponse();
        summary.setReservationId(resId);
        
        if (res.getGuest() != null) {
            String firstName = res.getGuest().getFirstName() != null ? res.getGuest().getFirstName() : "";
            String lastName = res.getGuest().getLastName() != null ? res.getGuest().getLastName() : "";
            summary.setGuestName((firstName + " " + lastName).trim());
            summary.setGuestPhone(res.getGuest().getPhone() != null ? res.getGuest().getPhone() : "");
            summary.setGuestIdentityNum(res.getGuest().getIdentityNum() != null ? res.getGuest().getIdentityNum() : "");
        } else {
            summary.setGuestName("");
            summary.setGuestPhone("");
            summary.setGuestIdentityNum("");
        }
        
        summary.setCheckIn(earliestCheckIn);
        summary.setCheckOut(latestCheckOut);
        
        summary.setHotelName("Hotel Haven");
        summary.setHotelAddress("Mỗ Lao, Hà Đông, Hà Nội");
        summary.setHotelPhone("+84 28 1234 5678");
        
        summary.setResRoomBill(lst);
        summary.setTotalDue();
        summary.setTotalPaid();
        summary.setTotal();

        return summary;
    }
}

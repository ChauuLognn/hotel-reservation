package com.hotelreservation.modules.billing.service.impl;

import static com.hotelreservation.modules.billing.dto.BillingResponses.*;
import com.hotelreservation.modules.billing.entity.Bill;
import com.hotelreservation.modules.billing.mapper.BillMapper;
import com.hotelreservation.modules.billing.repository.BillRepository;
import com.hotelreservation.modules.billing.service.BillService;
import static com.hotelreservation.modules.reservation.dto.ReservationResponses.ReservationGuestResponse;
import com.hotelreservation.modules.reservation.entity.Reservation;
import com.hotelreservation.modules.reservation.entity.ReservationRoom;
import com.hotelreservation.modules.reservation.mapper.ReservationMapper;
import com.hotelreservation.modules.reservation.repository.ReservationGuestRepository;
import com.hotelreservation.modules.reservation.repository.ReservationRoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;
import com.hotelreservation.modules.reservation.entity.ReservationGuest;

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
        ReservationRoom rr = rrRepo.getByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));
        List<Bill> items = billRepo.getByResRoomId(resRoomId);
        List<ReservationGuest> guests = resGuestRepo.findByIdReservationRoomId(resRoomId);
        return createResRoomBillSummary(rr, items, guests);
    }

    private ResRoomBillResponse createResRoomBillSummary(ReservationRoom rr, List<Bill> items, List<ReservationGuest> guests) {
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

        List<ReservationGuestResponse> guestResponses = guests.stream()
                .map(ReservationMapper::toGuestResponse)
                .collect(Collectors.toList());

        ResRoomBillResponse summary = new ResRoomBillResponse();
        summary.setRoomId(rr.getRoom().getId());
        summary.setResRoomId(rr.getId());
        summary.setCheckInTime(rr.getCheckInTime());
        summary.setCheckOutTime(rr.getCheckOutTime());
        summary.setRoomBills(billDtos);
        summary.setGuests(guestResponses);
        summary.setTotal(total);
        summary.setTotalPaid(totalPaid);
        summary.setTotalDue(totalDue);

        return summary;
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationBillResponse createReservationBillSummary(String resId) {
        List<ReservationRoom> rrs = rrRepo.findByReservationId(resId);
        if (rrs.isEmpty()) {
            throw new IllegalArgumentException("Reservation not found: " + resId);
        }
        Reservation res = rrs.get(0).getReservation();

        // Batch load all bills and guests of the reservation to resolve N+1 queries
        List<Bill> allBills = billRepo.getByResId(resId);
        List<ReservationGuest> allGuests = resGuestRepo.findByReservationId(resId);

        Map<String, List<Bill>> billsByRoom = allBills.stream()
                .filter(b -> b.getReservationRoom() != null)
                .collect(Collectors.groupingBy(b -> b.getReservationRoom().getId()));

        Map<String, List<ReservationGuest>> guestsByRoom = allGuests.stream()
                .filter(g -> g.getReservationRoom() != null)
                .collect(Collectors.groupingBy(g -> g.getReservationRoom().getId()));

        List<ResRoomBillResponse> lst = new ArrayList<>();

        LocalDate earliestCheckIn = null;
        LocalDate latestCheckOut = null;

        for(ReservationRoom rr : rrs){
            List<Bill> roomBills = billsByRoom.getOrDefault(rr.getId(), Collections.emptyList());
            List<ReservationGuest> roomGuests = guestsByRoom.getOrDefault(rr.getId(), Collections.emptyList());
            
            ResRoomBillResponse x = createResRoomBillSummary(rr, roomBills, roomGuests);
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

    @Override
    @Transactional(readOnly = true)
    public List<ReservationBillSummaryProjection> getReservationBillSummaries() {
        return billRepo.getReservationBillSummaries();
    }
}

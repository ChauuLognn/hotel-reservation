package modules.billing.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import modules.reservation.dto.ReservationGuestDto;
import modules.billing.dto.BillDTO;
import modules.billing.dto.ResRoomBillSummary;
import modules.billing.dto.ReservationBillSummary;
import modules.billing.entity.Bill;
import modules.reservation.entity.Reservation;
import modules.reservation.entity.ReservationRoom;
import modules.billing.repository.BillRepository;
import modules.reservation.repository.ReservationGuestRepository;
import modules.reservation.repository.ReservationRoomRepository;

@Service
public class BillDomain {

    @Autowired private BillRepository billRepo;
    @Autowired private ReservationRoomRepository rrRepo;
    @Autowired private ReservationGuestRepository resGuestRepo;
    @PersistenceContext
    private EntityManager em;

    // lấy mọi bill của reservation
    public List<BillDTO> getByResId(String resId){
        List<Bill> bills = billRepo.getByResId(resId);
        return bills.stream().map(BillDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // lấy mọi bill của resRoom
    public List<BillDTO> getByResRoomId(String resRoomId){
        List<Bill> bills = billRepo.getByResRoomId(resRoomId);
        return bills.stream().map(BillDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // đánh dấu đã trả cho các bill của reservation
    @Transactional
    public void ConfirmedPaidBillsForResId(String resId){
        billRepo.markBillsPaidForResId(resId);
    }

    // đánh dấu đã trả cho các bill của resRoom
    @Transactional
    public void ConfirmedPaidBillsForResRoomId(String resRoomId){
        billRepo.markBillsPaidForResRoomId(resRoomId);
    }

    // tạo thống kê bill cho resRoom
    @Transactional(readOnly = true)
    public ResRoomBillSummary createResRoomBillSummary(String resRoomId) {
        // Lấy tất cả bill của 1 ReservationRoom
        List<Bill> items = billRepo.getByResRoomId(resRoomId);

        // Đổi sang BillDTO
        List<BillDTO> billDtos = items.stream()
                .map(BillDTO::fromEntity)
                .collect(Collectors.toList());

        // tính các khoản tiền (đã trả, chưa trả, tổng số tiền sử dụng)
        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal totalDue = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;

        for(BillDTO dto : billDtos){
            total = total.add(dto.getTotalAmount());
            if(dto.getStatus().equals("PAID"))  
                totalPaid = totalPaid.add(dto.getTotalAmount());
            else
                totalDue = totalDue.add(dto.getTotalAmount());
        }

        ReservationRoom rr = rrRepo.getByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));
        
        // Lấy danh sách khách lưu trú trong phòng
        List<ReservationGuestDto> guests = resGuestRepo.findByIdReservationRoomId(resRoomId)
            .stream()
            .map(ReservationGuestDto::fromEntity)
            .collect(Collectors.toList());
        
        ResRoomBillSummary summary = new ResRoomBillSummary();
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

    // tạo thống kê bill cho reservation
    @Transactional(readOnly = true)
    public ReservationBillSummary createReservationBillSummary(String resId){
        // Lấy thông tin reservation với eager load guest để tránh LazyInitializationException
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
        
        // lấy danh sách các resRoom của reservation
        List<ReservationRoom> rrs = rrRepo.findByReservationId(resId);

        // dánh sách các thống kê bill của mỗi resRoom
        List<ResRoomBillSummary> lst = new ArrayList<>();

        LocalDate earliestCheckIn = null;
        LocalDate latestCheckOut = null;

        for(ReservationRoom rr : rrs){
            // tạo thống kê bill cho từng resRoom
            ResRoomBillSummary x = createResRoomBillSummary(rr.getId());
            lst.add(x);
            
            // Tìm ngày đến sớm nhất và ngày đi muộn nhất
            if(earliestCheckIn == null || rr.getCheckInTime().isBefore(earliestCheckIn)) {
                earliestCheckIn = rr.getCheckInTime();
            }
            if(latestCheckOut == null || rr.getCheckOutTime().isAfter(latestCheckOut)) {
                latestCheckOut = rr.getCheckOutTime();
            }
        }

        ReservationBillSummary summary = new ReservationBillSummary();
        summary.setReservationId(resId);
        
        // Thông tin khách thuê - đảm bảo guest đã được load
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
        
        // Thông tin khách sạn (có thể lấy từ config hoặc hardcode)
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
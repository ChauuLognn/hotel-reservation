package com.hotelreservation.modules.reservation.service.impl;

import com.hotelreservation.common.enums.ReservationStatus;
import com.hotelreservation.modules.account.entity.User;
import com.hotelreservation.modules.billing.repository.BillRepository;
import com.hotelreservation.modules.reservation.dto.ReservationRequests.ChangeStatusRequest;
import com.hotelreservation.modules.reservation.dto.ReservationResponses.ReservationGuestResponse;
import com.hotelreservation.modules.reservation.entity.Reservation;
import com.hotelreservation.modules.reservation.entity.ReservationGuest;
import com.hotelreservation.modules.reservation.entity.ReservationRoom;
import com.hotelreservation.modules.reservation.entity.ReservationStatusHistory;
import com.hotelreservation.modules.reservation.mapper.ReservationMapper;
import com.hotelreservation.modules.reservation.repository.ReservationGuestRepository;
import com.hotelreservation.modules.reservation.repository.ReservationRepository;
import com.hotelreservation.modules.reservation.repository.ReservationRoomRepository;
import com.hotelreservation.modules.reservation.repository.ReservationStatusHistoryRepository;
import com.hotelreservation.modules.reservation.service.ReservationStatusService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import jakarta.annotation.PostConstruct;

@Service
@Transactional
@SuppressWarnings("null")
public class ReservationStatusServiceImpl implements ReservationStatusService {

    private static final Logger log = LoggerFactory.getLogger(ReservationStatusServiceImpl.class);

    @Autowired private ReservationRepository resRepo;
    @Autowired private ReservationRoomRepository rrRepo;
    @Autowired private ReservationStatusHistoryRepository statusHistoryRepo;
    @Autowired private ReservationGuestRepository resGuestRepo;
    @Autowired private BillRepository billRepo;

    @Autowired private com.hotelreservation.modules.account.repository.UserRepository userRepo;

    @PersistenceContext
    private EntityManager em;

    private Integer getSystemUserId() {
        return userRepo.findByAccount("system")
            .map(User::getId)
            .orElseThrow(() -> new IllegalStateException("System user 'system' not found in database."));
    }

    private static final Map<ReservationStatus, Set<ReservationStatus>> Allowed;
    static {
        Map<ReservationStatus, Set<ReservationStatus>> m = new EnumMap<>(ReservationStatus.class);
        m.put(ReservationStatus.PENDING_PAYMENT, EnumSet.of(ReservationStatus.CONFIRMED, ReservationStatus.PENDING_EXPIRED, ReservationStatus.CANCELLED));
        m.put(ReservationStatus.CONFIRMED, EnumSet.of(ReservationStatus.CHECK_IN, ReservationStatus.CANCELLED));
        m.put(ReservationStatus.CHECK_IN, EnumSet.of(ReservationStatus.CHECK_OUT));
        m.put(ReservationStatus.CHECK_OUT, EnumSet.noneOf(ReservationStatus.class));
        m.put(ReservationStatus.CANCELLED, EnumSet.noneOf(ReservationStatus.class));
        m.put(ReservationStatus.PENDING_EXPIRED, EnumSet.noneOf(ReservationStatus.class));
        Allowed = m;
    }

    private void ValidTransitionStatus(ReservationStatus from, ReservationStatus to) {
        if (from == to) {
            throw new IllegalStateException("Duplicated status");
        }
        Set<ReservationStatus> allowed = Allowed.get(from);
        if (allowed == null || !allowed.contains(to)) {
            throw new IllegalStateException("Invalide transition from " + from + " to " + to);
        }
    }

    private ReservationStatus CurrentStatusOfResRoom(String resRoomId) {
        Optional<ReservationStatusHistory> opt = statusHistoryRepo.findLatestByResRoomId(resRoomId);
        if (opt.isPresent()) {
            return opt.get().getNewStatus();
        }
        return ReservationStatus.PENDING_PAYMENT;
    }

    @Override
    public ReservationGuestResponse setCheckIn(String resRoomId, Integer guestId, LocalDateTime checkInAt) {
        // Concurrency Lock: Lock ReservationGuest row to prevent race conditions on double check-ins
        ReservationGuest rg = resGuestRepo.findByResRoomIdAndGuestIdForUpdate(resRoomId, guestId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationGuest not found"));

        ReservationStatusHistory rsh = statusHistoryRepo.findLatestByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("this resRoom has no status record"));

        if(rsh.getNewStatus() == ReservationStatus.PENDING_PAYMENT)
            throw new IllegalStateException("ResRoom has to be paid first");
        
        if(rg.getCheckInAt() != null)
            throw new IllegalStateException("Guest đã checkIn");

        LocalDateTime now = LocalDateTime.now();
        if(checkInAt == null) checkInAt = now;

        rg.setCheckInAt(checkInAt);
        resGuestRepo.save(rg);

        if(rsh.getNewStatus() == ReservationStatus.CONFIRMED) {
            // Lock the parent reservation room row to ensure concurrency safety on sequence generation
            rrRepo.getByResRoomIdForUpdate(resRoomId);
            
            statusHistoryRepo.insertResStatusHistory(resRoomId, rsh.getNewStatus().name(), 
                ReservationStatus.CHECK_IN.name(), now, getSystemUserId(), "automatically");
            
            // Automatically propagate CHECK_IN status to parent reservation
            ReservationRoom rr = rrRepo.getByResRoomId(resRoomId)
                .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));
            Reservation r = rr.getReservation();
            if (r.getStatus() != ReservationStatus.CHECK_IN) {
                r.setStatus(ReservationStatus.CHECK_IN);
                resRepo.save(r);
            }
        }

        return ReservationMapper.toGuestResponse(rg);
    }

    @Override
    public ReservationGuestResponse setCheckOut(String resRoomId, Integer guestId, LocalDateTime checkOutAt) {
        // Concurrency Lock: Lock ReservationGuest row to prevent race conditions on double check-outs
        ReservationGuest rg = resGuestRepo.findByResRoomIdAndGuestIdForUpdate(resRoomId, guestId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationGuest not found"));

        ReservationStatusHistory rsh = statusHistoryRepo.findLatestByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("this resRoom has no status record"));

        if(rg.getCheckInAt() == null)
            throw new IllegalStateException("Khách chưa Check_In");
        
        if(rg.getCheckOutAt() != null)
            throw new IllegalStateException("Khách đã Check_Out");

        if(checkOutAt == null)
            checkOutAt = LocalDateTime.now();

        if(checkOutAt.isBefore(rg.getCheckInAt()))
            throw new IllegalArgumentException("thời điểm Check_Out phải sau khi Check_In");

        rg.setCheckOutAt(checkOutAt);
        resGuestRepo.save(rg);

        if(resGuestRepo.cntGuestHasNotCheckOutInResRoom(resRoomId) == 0 &&
            rsh.getNewStatus() == ReservationStatus.CHECK_IN) {
            this.updateResRoomStatus(resRoomId, 
                new ChangeStatusRequest(ReservationStatus.CHECK_OUT, "automatically"), getSystemUserId());
        }
            
        return ReservationMapper.toGuestResponse(rg);
    }

    @Override
    public void updateResRoomStatus(String resRoomId, ChangeStatusRequest req, Integer updatedByUserId) {
        // Pessimistic database lock on the reservation room row to ensure sequence safety and prevent state races
        ReservationRoom rr = rrRepo.getByResRoomIdForUpdate(resRoomId).
            orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));

        Reservation r = rr.getReservation();
        ReservationStatus statusOfRes = r.getStatus();

        if(statusOfRes == ReservationStatus.PENDING_PAYMENT && 
           req.getNewStatus() != ReservationStatus.CONFIRMED && 
           req.getNewStatus() != ReservationStatus.CANCELLED &&
           req.getNewStatus() != ReservationStatus.PENDING_EXPIRED) {
            throw new IllegalStateException("reservation of this room has to be confirmed first");
        }

        ReservationStatus oldSt = CurrentStatusOfResRoom(resRoomId);
        ReservationStatus newSt = req.getNewStatus();

        ValidTransitionStatus(oldSt, newSt);

        LocalDateTime now = LocalDateTime.now();

        if(newSt == ReservationStatus.CHECK_OUT)
            billRepo.insertServiceBills(resRoomId, now);
        else if(newSt == ReservationStatus.CANCELLED){
            if(rr.getCheckInTime().isBefore(LocalDate.now()))
                throw new IllegalStateException("cant cancelled resRoom that over time of checkIn");
            billRepo.insertRefundBills(resRoomId, now);
        }

        Integer effectiveUserId = updatedByUserId != null? updatedByUserId : getSystemUserId();
        User by = em.getReference(User.class, effectiveUserId);

        statusHistoryRepo.insertResStatusHistory(resRoomId, oldSt.name(), 
            newSt.name(), now, by.getId(), req.getReason());

        // Automatically propagate CHECK_IN/CHECK_OUT status updates from rooms to reservation
        if (newSt == ReservationStatus.CHECK_IN) {
            if (r.getStatus() != ReservationStatus.CHECK_IN) {
                r.setStatus(ReservationStatus.CHECK_IN);
                resRepo.save(r);
            }
        } else if (newSt == ReservationStatus.CHECK_OUT) {
            List<ReservationRoom> allRooms = rrRepo.findByReservationId(r.getId());
            boolean allCheckedOut = true;
            for (ReservationRoom room : allRooms) {
                ReservationStatus roomStatus = room.getId().equals(resRoomId) ? newSt : CurrentStatusOfResRoom(room.getId());
                if (roomStatus != ReservationStatus.CHECK_OUT && roomStatus != ReservationStatus.CANCELLED) {
                    allCheckedOut = false;
                    break;
                }
            }
            if (allCheckedOut && r.getStatus() != ReservationStatus.CHECK_OUT) {
                r.setStatus(ReservationStatus.CHECK_OUT);
                resRepo.save(r);
            }
        }
    }

    @Override
    public void updateReservationStatus(String resId, ChangeStatusRequest req, Integer updatedBy) {
        if (req == null || req.getNewStatus() == null) {
            throw new IllegalArgumentException("New status is required");
        }

        Reservation r = resRepo.findById(resId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        ReservationStatus newSt = req.getNewStatus();
        ReservationStatus oldSt = r.getStatus();

        ValidTransitionStatus(oldSt, newSt);

        if(newSt == ReservationStatus.CHECK_IN || newSt == ReservationStatus.CHECK_OUT)
            throw new IllegalStateException("invalid new status to update for a reservation");

        // Set Reservation status first
        r.setStatus(newSt);
        resRepo.save(r);

        if(newSt == ReservationStatus.CONFIRMED){
            billRepo.insertRoomChargeBills(resId, LocalDateTime.now());
        }

        Integer effectiveUserId = updatedBy != null? updatedBy : getSystemUserId();
        User by = em.getReference(User.class, effectiveUserId);

        List<ReservationRoom> rooms = rrRepo.findByReservationId(resId);

        for(ReservationRoom rr : rooms){
            String resRoomId = rr.getId();
            try {
                updateResRoomStatus(resRoomId, req, by.getId());
            } catch (Exception e) {
                throw new IllegalStateException("Failed to transition room " + resRoomId + " to " + newSt + ": " + e.getMessage(), e);
            }
        }
    }
}

package com.hotelreservation.module.reservation.service.impl;

import com.hotelreservation.common.enums.ReservationStatus;
import com.hotelreservation.module.account.entity.Guest;
import com.hotelreservation.module.account.entity.User;
import com.hotelreservation.module.account.repository.GuestRepository;
import com.hotelreservation.module.account.repository.UserRepository;
import com.hotelreservation.module.billing.repository.BillRepository;
import com.hotelreservation.module.hotelservice.dto.request.AddReservationServiceRequest;
import com.hotelreservation.module.hotelservice.dto.response.ReservationServiceResponse;
import com.hotelreservation.module.hotelservice.entity.HotelService;
import com.hotelreservation.module.hotelservice.mapper.ReservationServiceMapper;
import com.hotelreservation.module.hotelservice.repository.HotelServiceRepository;
import com.hotelreservation.module.hotelservice.repository.ReservationServiceRepository;
import com.hotelreservation.module.reservation.dto.request.CreateReservationRequest;
import com.hotelreservation.module.reservation.dto.request.ChangeStatusRequest;
import com.hotelreservation.module.reservation.dto.response.*;
import com.hotelreservation.module.reservation.entity.Reservation;
import com.hotelreservation.module.reservation.entity.ReservationGuest;
import com.hotelreservation.module.reservation.entity.ReservationRoom;
import com.hotelreservation.module.reservation.entity.ReservationStatusHistory;
import com.hotelreservation.module.reservation.mapper.ReservationMapper;
import com.hotelreservation.module.reservation.repository.ReservationGuestRepository;
import com.hotelreservation.module.reservation.repository.ReservationRepository;
import com.hotelreservation.module.reservation.repository.ReservationRoomRepository;
import com.hotelreservation.module.reservation.repository.ReservationStatusHistoryRepository;
import com.hotelreservation.module.reservation.service.ReservationService;
import com.hotelreservation.module.room.dto.response.AvailableRoomResponse;
import com.hotelreservation.module.room.entity.Room;
import com.hotelreservation.module.room.repository.RoomRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@SuppressWarnings("null")
public class ReservationServiceImpl implements ReservationService {
    @Autowired private RoomRepository roomRepo;
    @Autowired private ReservationRepository resRepo;
    @Autowired private ReservationRoomRepository rrRepo;
    @Autowired private ReservationRoomRepository resRoomRepo;
    @Autowired private GuestRepository guestRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ReservationStatusHistoryRepository statusHistoryRepo;
    @Autowired private ReservationStatusHistoryRepository rshRepo;
    @Autowired private ReservationStatusHistoryRepository resHistoryRepo;
    @Autowired private ReservationGuestRepository resGuestRepo;
    @Autowired private BillRepository billRepo;
    @Autowired private ReservationServiceRepository rSRepo;
    @Autowired private HotelServiceRepository serRepo;

    @PersistenceContext
    private EntityManager em;

    private Integer systemUserId = 9;

    private static final Map<ReservationStatus, Set<ReservationStatus>> Allowed;
    static {
        Map<ReservationStatus, Set<ReservationStatus>> m = new EnumMap<>(ReservationStatus.class);
        m.put(ReservationStatus.PENDING_PAYMENT, EnumSet.of(ReservationStatus.CONFIRMED, ReservationStatus.PENDING_EXPIRED, ReservationStatus.CANCELLED));
        m.put(ReservationStatus.CONFIRMED, EnumSet.of(ReservationStatus.CHECK_IN, ReservationStatus.CANCELLED));
        m.put(ReservationStatus.CHECK_IN, EnumSet.of(ReservationStatus.CHECK_OUT));
        m.put(ReservationStatus.CHECK_OUT, EnumSet.noneOf(ReservationStatus.class));
        m.put(ReservationStatus.CANCELLED, EnumSet.noneOf(ReservationStatus.class));
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

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getByResId(String resId) {
        Reservation r = resRepo.getResById(resId);
        List<ReservationRoom> lstRr = rrRepo.findByReservationId(resId);
        return ReservationMapper.toResponse(r, lstRr);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllReservations() {
        List<ReservationResponse> lst = new ArrayList<>();
        jakarta.persistence.Query query = em.createQuery(
            "SELECT DISTINCT r FROM Reservation r " +
            "LEFT JOIN FETCH r.guest " +
            "LEFT JOIN FETCH r.createdBy " +
            "ORDER BY r.bookingDate DESC",
            Reservation.class
        );
        @SuppressWarnings("unchecked")
        List<Reservation> reservations = query.getResultList();
        
        for(Reservation r : reservations){
            try {
                Guest guest = r.getGuest();
                if (guest == null) continue;
                List<ReservationRoom> rooms = rrRepo.findByReservationId(r.getId());
                ReservationResponse dto = ReservationMapper.toResponse(r, rooms);
                lst.add(dto);
            } catch (Exception e) {
                System.err.println("Error processing reservation " + r.getId() + ": " + e.getMessage());
            }
        }
        return lst;
    }

    @Override
    public InitialReservationResponse createReservationFromRequest(CreateReservationRequest req, Integer emp) {
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        Guest guest = guestRepo.findById(req.getGuestId())
            .orElseThrow(() -> new IllegalStateException("Guest not found: " + req.getGuestId()));
        User createdBy = userRepo.findById(emp)
            .orElseThrow(() -> new IllegalStateException("User not found: " + emp));

        String resId = UUID.randomUUID().toString();
        resRepo.insertReservation(
            resId,
            guest.getId(),
            BigDecimal.ZERO,
            createdBy.getId(),
            ReservationStatus.PENDING_PAYMENT.name(),
            now
        );

        Reservation res = resRepo.getLastResByGuestId(guest.getId())
            .orElseThrow(() -> new IllegalArgumentException("Reservation has not been created yet"));

        List<Integer> roomIds = new ArrayList<>();
        List<BigDecimal> totalPrices = new ArrayList<>();
        List<Long> nightStays = new ArrayList<>();

        for (CreateReservationRequest.RoomItem it : req.getItems()) {
            List<AvailableRoomResponse> available = roomRepo.findAvailableRooms(
                it.getCheckIn(), it.getCheckOut(), it.getRoomName(), null);

            List<Integer> candidate = available.stream()
                .filter(a -> a.getName().equals(it.getRoomName()))
                .map(AvailableRoomResponse::getRoomId)
                .limit(it.getRooms())
                .collect(Collectors.toList());

            if (candidate.size() < it.getRooms()) {
                throw new IllegalStateException("Not enough rooms available for this request");
            }

            long nights = ChronoUnit.DAYS.between(it.getCheckIn(), it.getCheckOut());
            if (nights <= 0) {
                throw new IllegalArgumentException("checkOut must be after checkIn");
            }

            for (Integer roomId : candidate) {
                Room r = roomRepo.findRoom(roomId)
                    .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));

                BigDecimal basePrice = r.getRoomType().getBasePrice();
                BigDecimal discount = (nights >= 7) ? new BigDecimal("0.10") : BigDecimal.ZERO;
                BigDecimal finalPricePerNight = basePrice.multiply(BigDecimal.ONE.subtract(discount));
                BigDecimal totalOfRoom = finalPricePerNight.multiply(BigDecimal.valueOf(nights));

                String resRoomId = UUID.randomUUID().toString();
                rrRepo.insertResRoom(
                    resRoomId,
                    res.getId(),
                    roomId,
                    it.getCheckIn(),
                    it.getCheckOut(),
                    finalPricePerNight,
                    totalOfRoom
                );

                statusHistoryRepo.insertResStatusHistory(
                    resRoomId,
                    ReservationStatus.PENDING_PAYMENT.name(),
                    ReservationStatus.PENDING_PAYMENT.name(),
                    now,
                    createdBy.getId(),
                    "initial create from request"
                );

                roomIds.add(roomId);
                nightStays.add(nights);
                totalPrices.add(totalOfRoom);
            }
        }

        em.flush();
        resRepo.recalculateTotal(res.getId());
        em.refresh(res);

        InitialReservationResponse.HoldResponse holdEcho = new InitialReservationResponse.HoldResponse(
            roomIds,
            totalPrices,
            nightStays,
            now
        );
        String guestName = guest.getFirstName() + " " + guest.getLastName();

        return new InitialReservationResponse(
            guestName,
            holdEcho,
            resId,
            res.getTotalAmount()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getAllResByGuestId(Integer guestId) {
        List<ReservationResponse> lst = new ArrayList<>();
        List<Reservation> reservations = resRepo.getAllResByGuestId(guestId);
        for(Reservation r : reservations){
            lst.add(ReservationMapper.toResponse(r, rrRepo.findByReservationId(r.getId())));
        }
        return lst;
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getLastResByGuestId(Integer guestId) {
        Reservation r = resRepo.getLastResByGuestId(guestId)
            .orElseThrow(() -> new IllegalArgumentException("Guest has no reservation yet"));
        return ReservationMapper.toResponse(r, rrRepo.findByReservationId(r.getId()));
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ReservationRoomResponse> getResRoomByResId(String resId) {
        List<ReservationRoom> lst = rrRepo.findByReservationId(resId);
        return lst.stream().map(ReservationMapper::toRoomResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationRoomResponse getResRoomById(String resRoomId) {
        ReservationRoom rr = resRoomRepo.getByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found"));
        return ReservationMapper.toRoomResponse(rr);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationGuestResponse> getResGuestByResRoom(String resRoomId) {
        List<ReservationGuest> lst = resGuestRepo.findByIdReservationRoomId(resRoomId);
        return lst.stream().map(ReservationMapper::toGuestResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteResRoom(String resRoomId) {
        if(!resRoomRepo.existsById(resRoomId))
            throw new IllegalArgumentException("ReservationRoom not found: " + resRoomId);
        resRoomRepo.deleteById(resRoomId);
    }

    @Override
    @Transactional(readOnly = true)
    public GuestStayResponse getStaysOfGuest(Integer guestId) {
        List<ReservationGuest> lst = resGuestRepo.findByIdGuestId(guestId);
        Guest guest = guestRepo.findById(guestId)
            .orElseThrow(()-> new IllegalArgumentException("Guest not found: " + guestId));

        GuestStayResponse dto = new GuestStayResponse();
        dto.setGuestName(guest.getFirstName() + " " + guest.getLastName());
        dto.setIdentityNum(guest.getIdentityNum());
        List<GuestStayResponse.Item> items = new ArrayList<>();
        for(ReservationGuest rg : lst){
            GuestStayResponse.Item tmp = new GuestStayResponse.Item();
            tmp.setRoomId(rg.getReservationRoom().getRoom().getId());
            tmp.setCheckInAt(rg.getCheckInAt());
            tmp.setCheckOutAt(rg.getCheckOutAt());
            items.add(tmp);
        }
        dto.setItems(items);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationGuestResponse> getGuestsByResRoomId(String resRoomId) {
        List<ReservationGuest> guests = resGuestRepo.findByIdReservationRoomId(resRoomId);
        List<ReservationGuestResponse> dtos = new ArrayList<>();
        for(ReservationGuest rg : guests){
            dtos.add(ReservationMapper.toGuestResponse(rg));
        }
        return dtos;
    }

    @Override
    public ReservationGuestResponse createReservationGuest(String resRoomId, Integer guestId) {     
        ReservationStatusHistory rsh = rshRepo.findLatestByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("this resRoom has no status record"));
        
        if(rsh.getNewStatus() != ReservationStatus.CONFIRMED 
            && rsh.getNewStatus() != ReservationStatus.CHECK_IN)
            throw new IllegalStateException("Cant add guest to this room");

        resGuestRepo.insertResGuest(resRoomId, guestId);

        ReservationGuest rg = resGuestRepo.findByResRoomIdAndGuestId(resRoomId, guestId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationGuest has not been created"));
        
        return ReservationMapper.toGuestResponse(rg);
    }

    @Override
    public ReservationGuestResponse setCheckIn(String resRoomId, Integer guestId, LocalDateTime checkInAt) {
        ReservationStatusHistory rsh = rshRepo.findLatestByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("this resRoom has no status record"));

        if(rsh.getNewStatus() == ReservationStatus.PENDING_PAYMENT)
            throw new IllegalStateException("ResRoom has to be paid first");

        ReservationGuest rg = resGuestRepo.findByResRoomIdAndGuestId(resRoomId, guestId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationGuest not found"));
        
        if(rg.getCheckInAt() != null)
            throw new IllegalStateException("Guest đã checkIn");

        LocalDateTime now = LocalDateTime.now();
        if(checkInAt == null) checkInAt = now;

        rg.setCheckInAt(checkInAt);

        if(rsh.getNewStatus() == ReservationStatus.CONFIRMED)
            rshRepo.insertResStatusHistory(resRoomId, rsh.getNewStatus().name(), 
                "CHECK_IN", now, 9, "automatically");

        return ReservationMapper.toGuestResponse(rg);
    }

    @Override
    public ReservationGuestResponse setCheckOut(String resRoomId, Integer guestId, LocalDateTime checkOutAt) {
        ReservationStatusHistory rsh = rshRepo.findLatestByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("this resRoom has no status record"));

        ReservationGuest rg = resGuestRepo.findByResRoomIdAndGuestId(resRoomId, guestId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationGuest not found"));

        if(rg.getCheckInAt() == null)
            throw new IllegalStateException("Khách chưa Check_In");
        
        if(rg.getCheckOutAt() != null)
            throw new IllegalStateException("Khách đã Check_Out");

        if(checkOutAt == null)
            checkOutAt = LocalDateTime.now();

        if(checkOutAt.isBefore(rg.getCheckInAt()))
            throw new IllegalArgumentException("thời điểm Check_Out phải sau khi Check_In");

        rg.setCheckOutAt(checkOutAt);

        if(resGuestRepo.cntGuestHasNotCheckOutInResRoom(resRoomId) == 0 &&
            rsh.getNewStatus() == ReservationStatus.CHECK_IN)
            this.updateResRoomStatus(resRoomId, 
                new ChangeStatusRequest(ReservationStatus.CHECK_OUT, "automatically"), 9);
            
        return ReservationMapper.toGuestResponse(rg);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getHistoryByReservation(String resId) {
        List<ReservationStatusHistory> lst = resHistoryRepo.findByResId(resId);
        return lst.stream().map(ReservationMapper::toStatusHistoryResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getHistoryByReservationRoom(String resRoomId) {
        ReservationRoom rr = resRoomRepo.findById(resRoomId)
                .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));

        List<ReservationStatusHistory> list = resHistoryRepo.findByResRoomId(rr.getId());
        return list.stream().map(ReservationMapper::toStatusHistoryResponse).collect(Collectors.toList());
    }
 
    private ReservationStatus CurrentStatusOfResRoom(String resRoomId) {
        Optional<ReservationStatusHistory> opt = resHistoryRepo.findLatestByResRoomId(resRoomId);
        if (opt.isPresent()) {
            return opt.get().getNewStatus();
        }
        return ReservationStatus.PENDING_PAYMENT;
    }

    @Override
    public void updateResRoomStatus(String resRoomId, ChangeStatusRequest req, Integer updatedByUserId) {
        ReservationRoom rr = resRoomRepo.getByResRoomId(resRoomId).
            orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));

        Reservation r = rr.getReservation();
        ReservationStatus statusOfRes = r.getStatus();

        if(statusOfRes == ReservationStatus.PENDING_PAYMENT && 
           req.getNewStatus() != ReservationStatus.CONFIRMED && 
           req.getNewStatus() != ReservationStatus.CANCELLED) {
            throw new IllegalStateException("reservation of this room has to be confirmed first");
        }

        ReservationStatus oldSt = CurrentStatusOfResRoom(resRoomId);
        ReservationStatus newSt = req.getNewStatus();

        ValidTransitionStatus(oldSt, newSt);

        LocalDateTime now = LocalDateTime.now();

        if(newSt == ReservationStatus.CHECK_OUT)
            billRepo.insertServiceBills(resRoomId, now);
        else if(newSt == ReservationStatus.CANCELLED){
            if(rr.getCheckInTime().isAfter(LocalDate.now()))
                throw new IllegalStateException("cant cancelled resRoom that over time of checkIn");
            billRepo.insertRefundBills(resRoomId, now);
        }

        Integer effectiveUserId = updatedByUserId != null? updatedByUserId : systemUserId;
        User by = em.getReference(User.class, effectiveUserId);

        resHistoryRepo.insertResStatusHistory(resRoomId, oldSt.name(), 
            newSt.name(), now, by.getId(), req.getReason());
    }             
    
    @Override
    public void updateReservationStatus(String resId, ChangeStatusRequest req, Integer updatedBy) {
        Reservation r = resRepo.findById(resId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        ReservationStatus newSt = req.getNewStatus();
        ReservationStatus oldSt = r.getStatus();

        ValidTransitionStatus(oldSt, newSt);

        if(newSt == ReservationStatus.CHECK_IN || newSt == ReservationStatus.CHECK_OUT)
            throw new IllegalStateException("invalid new status to update for a reservation");

        if(newSt == ReservationStatus.CONFIRMED){
            r.setStatus(newSt);
            resRepo.save(r);
            billRepo.insertRoomChargeBills(resId, LocalDateTime.now());
        }
        else if(newSt == ReservationStatus.PENDING_EXPIRED){
            r.setStatus(newSt);
            resRepo.save(r);
            return;
        }

        Integer effectiveUserId = updatedBy != null? updatedBy : systemUserId;
        User by = em.getReference(User.class, effectiveUserId);

        List<ReservationRoom> rooms = resRoomRepo.findByReservationId(resId);
        boolean noRoomHasChangeStatus = true;

        for(ReservationRoom rr : rooms){
            String resRoomId = rr.getId();
            try{
                updateResRoomStatus(resRoomId, req, by.getId());
                noRoomHasChangeStatus = false;
            } catch(IllegalStateException e){
                // ignore
            }
        }
        if(newSt == ReservationStatus.CANCELLED){
            if(!noRoomHasChangeStatus){
                r.setStatus(newSt);
                resRepo.save(r);
            }
            else throw new IllegalStateException("cant change status for this reservation");
        }
    }

    @Override
    public void createReservationService(String resRoomId, AddReservationServiceRequest rq, Integer userId) {
        if(billRepo.getByResRoomId(resRoomId).size() > 1)
            throw new IllegalStateException("cant serve this room for some reason");

        HotelService ser = serRepo.findByName(rq.getName())
                .orElseThrow(() -> new IllegalArgumentException("HotelService not found"));
        
        BigDecimal totalAmount = ser.getPrice().multiply(BigDecimal.valueOf(rq.getQuantity()));
        String id = UUID.randomUUID().toString();

        rSRepo.insertResService(id, resRoomId, ser.getId(),
            rq.getQuantity().byteValue(), totalAmount, LocalDateTime.now(), userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationServiceResponse> getAllServicesOfResRoom(String resRoomId) {
        return rSRepo.getByResRoomId(resRoomId).stream()
            .map(ReservationServiceMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteReservationService(String id) {
        if(!rSRepo.existsById(id))
            throw new IllegalArgumentException("Theres no reservationService to delete");
        rSRepo.delete(id);
    }
}

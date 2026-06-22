package com.hotelreservation.modules.reservation.service.impl;

import com.hotelreservation.common.enums.ReservationStatus;
import com.hotelreservation.modules.account.entity.Guest;
import com.hotelreservation.modules.account.entity.User;
import com.hotelreservation.modules.account.repository.GuestRepository;
import com.hotelreservation.modules.account.repository.UserRepository;
import com.hotelreservation.modules.billing.repository.BillRepository;
import static com.hotelreservation.modules.hotelservice.dto.HotelserviceRequests.*;
import static com.hotelreservation.modules.hotelservice.dto.HotelserviceResponses.*;
import com.hotelreservation.modules.hotelservice.entity.HotelService;
import com.hotelreservation.modules.hotelservice.entity.UsedService;
import com.hotelreservation.modules.hotelservice.mapper.HotelserviceMapper;
import com.hotelreservation.modules.hotelservice.repository.HotelServiceRepository;
import com.hotelreservation.modules.hotelservice.repository.UsedServiceRepository;
import static com.hotelreservation.modules.reservation.dto.ReservationRequests.*;
import static com.hotelreservation.modules.reservation.dto.ReservationResponses.*;
import com.hotelreservation.modules.reservation.entity.Reservation;
import com.hotelreservation.modules.reservation.entity.ReservationGuest;
import com.hotelreservation.modules.reservation.entity.ReservationRoom;
import com.hotelreservation.modules.reservation.entity.ReservationStatusHistory;
import com.hotelreservation.modules.reservation.mapper.ReservationMapper;
import com.hotelreservation.modules.reservation.repository.ReservationGuestRepository;
import com.hotelreservation.modules.reservation.repository.ReservationRepository;
import com.hotelreservation.modules.reservation.repository.ReservationRoomRepository;
import com.hotelreservation.modules.reservation.repository.ReservationStatusHistoryRepository;
import com.hotelreservation.modules.reservation.service.ReservationService;
import static com.hotelreservation.modules.room.dto.RoomResponses.*;
import com.hotelreservation.modules.room.entity.Room;
import com.hotelreservation.modules.room.repository.RoomRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Value;
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
    @Autowired private GuestRepository guestRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ReservationStatusHistoryRepository statusHistoryRepo;
    @Autowired private ReservationGuestRepository resGuestRepo;
    @Autowired private BillRepository billRepo;
    @Autowired private UsedServiceRepository rSRepo;
    @Autowired private HotelServiceRepository serRepo;

    @PersistenceContext
    private EntityManager em;

    @Value("${system-user-id:9}")
    private Integer systemUserId;

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
        return toReservationResponse(r, lstRr);
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
                ReservationResponse dto = toReservationResponse(r, rooms);
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

        Reservation res = resRepo.findById(resId)
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
            lst.add(toReservationResponse(r, rrRepo.findByReservationId(r.getId())));
        }
        return lst;
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationResponse getLastResByGuestId(Integer guestId) {
        Reservation r = resRepo.getLastResByGuestId(guestId)
            .orElseThrow(() -> new IllegalArgumentException("Guest has no reservation yet"));
        return toReservationResponse(r, rrRepo.findByReservationId(r.getId()));
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
        ReservationRoom rr = rrRepo.getByResRoomId(resRoomId)
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
        if(!rrRepo.existsById(resRoomId))
            throw new IllegalArgumentException("ReservationRoom not found: " + resRoomId);
        rrRepo.deleteById(resRoomId);
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
        ReservationStatusHistory rsh = statusHistoryRepo.findLatestByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("this resRoom has no status record"));
        
        if(rsh.getNewStatus() != ReservationStatus.CONFIRMED 
            && rsh.getNewStatus() != ReservationStatus.CHECK_IN)
            throw new IllegalStateException("Cant add guest to this room");

        // Overlapping date check
        ReservationRoom rr = rrRepo.getByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));
        Long overlaps = resGuestRepo.countOverlappingStays(guestId, resRoomId, rr.getCheckInTime(), rr.getCheckOutTime());
        if (overlaps > 0) {
            throw new IllegalStateException("Khách hàng đã có phòng khác trong thời gian này");
        }

        resGuestRepo.insertResGuest(resRoomId, guestId);

        ReservationGuest rg = resGuestRepo.findByResRoomIdAndGuestId(resRoomId, guestId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationGuest has not been created"));
        
        return ReservationMapper.toGuestResponse(rg);
    }

    @Override
    public ReservationGuestResponse setCheckIn(String resRoomId, Integer guestId, LocalDateTime checkInAt) {
        ReservationStatusHistory rsh = statusHistoryRepo.findLatestByResRoomId(resRoomId)
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

        if(rsh.getNewStatus() == ReservationStatus.CONFIRMED) {
            statusHistoryRepo.insertResStatusHistory(resRoomId, rsh.getNewStatus().name(), 
                ReservationStatus.CHECK_IN.name(), now, systemUserId, "automatically");
            
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
        ReservationStatusHistory rsh = statusHistoryRepo.findLatestByResRoomId(resRoomId)
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
            rsh.getNewStatus() == ReservationStatus.CHECK_IN) {
            this.updateResRoomStatus(resRoomId, 
                new ChangeStatusRequest(ReservationStatus.CHECK_OUT, "automatically"), systemUserId);
        }
            
        return ReservationMapper.toGuestResponse(rg);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getHistoryByReservation(String resId) {
        List<ReservationStatusHistory> lst = statusHistoryRepo.findByResId(resId);
        return lst.stream().map(ReservationMapper::toStatusHistoryResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<StatusHistoryResponse> getHistoryByReservationRoom(String resRoomId) {
        ReservationRoom rr = rrRepo.findById(resRoomId)
                .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));

        List<ReservationStatusHistory> list = statusHistoryRepo.findByResRoomId(rr.getId());
        return list.stream().map(ReservationMapper::toStatusHistoryResponse).collect(Collectors.toList());
    }
 
    private ReservationStatus CurrentStatusOfResRoom(String resRoomId) {
        Optional<ReservationStatusHistory> opt = statusHistoryRepo.findLatestByResRoomId(resRoomId);
        if (opt.isPresent()) {
            return opt.get().getNewStatus();
        }
        return ReservationStatus.PENDING_PAYMENT;
    }

    @Override
    public void updateResRoomStatus(String resRoomId, ChangeStatusRequest req, Integer updatedByUserId) {
        ReservationRoom rr = rrRepo.getByResRoomId(resRoomId).
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
            if(rr.getCheckInTime().isBefore(LocalDate.now()))
                throw new IllegalStateException("cant cancelled resRoom that over time of checkIn");
            billRepo.insertRefundBills(resRoomId, now);
        }

        Integer effectiveUserId = updatedByUserId != null? updatedByUserId : systemUserId;
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

        Integer effectiveUserId = updatedBy != null? updatedBy : systemUserId;
        User by = em.getReference(User.class, effectiveUserId);

        List<ReservationRoom> rooms = rrRepo.findByReservationId(resId);
        boolean noRoomHasChangeStatus = true;

        for(ReservationRoom rr : rooms){
            String resRoomId = rr.getId();
            try{
                updateResRoomStatus(resRoomId, req, by.getId());
                noRoomHasChangeStatus = false;
            } catch(IllegalStateException | IllegalArgumentException e){
                // ignore
            }
        }

        if(noRoomHasChangeStatus){
            throw new IllegalStateException("Cannot change status because no rooms could transition");
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
            .map(HotelserviceMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteReservationService(String id) {
        if(!rSRepo.existsById(id))
            throw new IllegalArgumentException("Theres no reservationService to delete");
        rSRepo.delete(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationFullDetailResponse getReservationFullDetail(String resId) {
        Reservation r = resRepo.findById(resId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + resId));

        ReservationFullDetailResponse resp = new ReservationFullDetailResponse();
        resp.setId(r.getId());
        if (r.getGuest() != null) {
            String firstName = r.getGuest().getFirstName() != null ? r.getGuest().getFirstName() : "";
            String lastName = r.getGuest().getLastName() != null ? r.getGuest().getLastName() : "";
            resp.setGuestName((firstName + " " + lastName).trim());
            resp.setGuestPhone(r.getGuest().getPhone());
        } else {
            resp.setGuestName("");
            resp.setGuestPhone("");
        }
        resp.setTotal(r.getTotalAmount());
        resp.setStatus(r.getStatus() != null ? r.getStatus().name() : "");
        resp.setBookingDate(r.getBookingDate());

        List<ReservationRoom> rooms = rrRepo.findByReservationId(resId);
        resp.setOverallRoomStatus(computeOverallRoomStatus(rooms, r));
        LocalDate earliestCheckIn = null;
        LocalDate latestCheckOut = null;

        List<ReservationFullDetailResponse.RoomDetailItem> roomItems = new ArrayList<>();
        for (ReservationRoom rr : rooms) {
            ReservationFullDetailResponse.RoomDetailItem item = new ReservationFullDetailResponse.RoomDetailItem();
            item.setId(rr.getId());
            item.setRoomId(rr.getRoom().getId());
            item.setRoomTypeName(rr.getRoom().getRoomType().getName());
            item.setCheckInTime(rr.getCheckInTime());
            item.setCheckOutTime(rr.getCheckOutTime());
            item.setTotalPrice(rr.getTotalPrice());

            if (earliestCheckIn == null || rr.getCheckInTime().isBefore(earliestCheckIn)) {
                earliestCheckIn = rr.getCheckInTime();
            }
            if (latestCheckOut == null || rr.getCheckOutTime().isAfter(latestCheckOut)) {
                latestCheckOut = rr.getCheckOutTime();
            }

            // Guests
            List<ReservationGuestResponse> guests = resGuestRepo.findByIdReservationRoomId(rr.getId())
                .stream()
                .map(ReservationMapper::toGuestResponse)
                .collect(Collectors.toList());
            item.setGuests(guests);

            // Services
            List<ReservationServiceResponse> services = rSRepo.getByResRoomId(rr.getId())
                .stream()
                .map(HotelserviceMapper::toResponse)
                .collect(Collectors.toList());
            item.setServices(services);

            roomItems.add(item);
        }

        resp.setRooms(roomItems);
        resp.setCheckIn(earliestCheckIn);
        resp.setCheckOut(latestCheckOut);

        return resp;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getMyBookings() {
        String account = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByAccount(account)
            .orElseThrow(() -> new IllegalStateException("User not found: " + account));

        Guest guest = user.getGuest();
        if (guest != null) {
            List<Reservation> reservations = resRepo.getAllResByGuestId(guest.getId());
            List<ReservationResponse> responseList = new ArrayList<>();
            for (Reservation r : reservations) {
                List<ReservationRoom> rooms = rrRepo.findByReservationId(r.getId());
                responseList.add(toReservationResponse(r, rooms));
            }
            return responseList;
        }
        return Collections.emptyList();
    }

    private String computeOverallRoomStatus(List<ReservationRoom> rooms, Reservation r) {
        if (r.getStatus() == com.hotelreservation.common.enums.ReservationStatus.CANCELLED) {
            return "CANCELLED";
        }
        if (r.getStatus() == com.hotelreservation.common.enums.ReservationStatus.PENDING_EXPIRED) {
            return "PENDING_EXPIRED";
        }
        if (r.getStatus() == com.hotelreservation.common.enums.ReservationStatus.PENDING_PAYMENT) {
            return "PENDING_PAYMENT";
        }
        if (rooms == null || rooms.isEmpty()) {
            return r.getStatus().name();
        }

        boolean anyCheckIn = false;
        boolean allCheckOutOrCancelled = true;

        for (ReservationRoom rr : rooms) {
            com.hotelreservation.common.enums.ReservationStatus roomSt = CurrentStatusOfResRoom(rr.getId());
            if (roomSt == com.hotelreservation.common.enums.ReservationStatus.CHECK_IN) {
                anyCheckIn = true;
            }
            if (roomSt != com.hotelreservation.common.enums.ReservationStatus.CHECK_OUT && roomSt != com.hotelreservation.common.enums.ReservationStatus.CANCELLED) {
                allCheckOutOrCancelled = false;
            }
        }

        if (anyCheckIn) {
            return "CHECK_IN";
        }
        if (allCheckOutOrCancelled) {
            return "CHECK_OUT";
        }
        return r.getStatus().name();
    }

    private ReservationResponse toReservationResponse(Reservation r, List<ReservationRoom> rooms) {
        ReservationResponse dto = ReservationMapper.toResponse(r, rooms);
        if (dto != null) {
            dto.setOverallRoomStatus(computeOverallRoomStatus(rooms, r));
        }
        return dto;
    }
}

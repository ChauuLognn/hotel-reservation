package com.hotelreservation.reservation.service;

import com.hotelreservation.common.enums.ReservationStatus;
import com.hotelreservation.account.entity.Guest;
import com.hotelreservation.account.entity.User;
import com.hotelreservation.account.repository.GuestRepository;
import com.hotelreservation.account.repository.UserRepository;
import com.hotelreservation.hotelservice.dto.HotelserviceResponses.ReservationServiceResponse;
import com.hotelreservation.hotelservice.mapper.HotelserviceMapper;
import com.hotelreservation.hotelservice.repository.UsedServiceRepository;
import com.hotelreservation.reservation.dto.ReservationResponses.*;
import com.hotelreservation.reservation.entity.Reservation;
import com.hotelreservation.reservation.entity.ReservationGuest;
import com.hotelreservation.reservation.entity.ReservationRoom;
import com.hotelreservation.reservation.entity.ReservationStatusHistory;
import com.hotelreservation.reservation.mapper.ReservationMapper;
import com.hotelreservation.reservation.repository.ReservationGuestRepository;
import com.hotelreservation.reservation.repository.ReservationRepository;
import com.hotelreservation.reservation.repository.ReservationRoomRepository;
import com.hotelreservation.reservation.repository.ReservationStatusHistoryRepository;
import com.hotelreservation.reservation.service.ReservationQueryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@SuppressWarnings("null")
public class ReservationQueryServiceImpl implements ReservationQueryService {

    @Autowired private ReservationRepository resRepo;
    @Autowired private ReservationRoomRepository rrRepo;
    @Autowired private GuestRepository guestRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ReservationStatusHistoryRepository statusHistoryRepo;
    @Autowired private ReservationGuestRepository resGuestRepo;
    @Autowired private UsedServiceRepository rSRepo;

    @PersistenceContext
    private EntityManager em;

    @Override
    public ReservationResponse getByResId(String resId) {
        Reservation r = resRepo.getResById(resId);
        if (r == null) {
            return null;
        }
        List<ReservationRoom> lstRr = rrRepo.findByReservationId(resId);
        
        // Eager load status history mapping to prevent N+1 queries
        Map<String, ReservationStatus> roomStatusMap = getLatestRoomStatusMap(lstRr);
        return toReservationResponse(r, lstRr, roomStatusMap);
    }

    @Override
    public List<ReservationResponse> getAllReservations() {
        List<ReservationResponse> lst = new ArrayList<>();
        List<Reservation> reservations = resRepo.findAllReservations();

        if (reservations.isEmpty()) {
            return lst;
        }

        // Batch load all ReservationRooms for all reservations in a single query
        List<String> resIds = reservations.stream().map(Reservation::getId).collect(Collectors.toList());
        List<ReservationRoom> allRooms = rrRepo.findByReservationIdIn(resIds);
        Map<String, List<ReservationRoom>> roomsByResIdMap = allRooms.stream()
                .collect(Collectors.groupingBy(rr -> rr.getReservation().getId()));

        // Batch load all latest status histories for all loaded rooms in a single query
        Map<String, ReservationStatus> roomStatusMap = getLatestRoomStatusMap(allRooms);

        for (Reservation r : reservations) {
            try {
                Guest guest = r.getGuest();
                if (guest == null) continue;
                List<ReservationRoom> rooms = roomsByResIdMap.getOrDefault(r.getId(), Collections.emptyList());
                ReservationResponse dto = toReservationResponse(r, rooms, roomStatusMap);
                lst.add(dto);
            } catch (Exception e) {
                System.err.println("Error processing reservation " + r.getId() + ": " + e.getMessage());
            }
        }
        return lst;
    }

    @Override
    public List<ReservationResponse> getAllResByGuestId(Integer guestId) {
        List<ReservationResponse> lst = new ArrayList<>();
        List<Reservation> reservations = resRepo.getAllResByGuestId(guestId);
        
        if (reservations.isEmpty()) {
            return lst;
        }

        List<String> resIds = reservations.stream().map(Reservation::getId).collect(Collectors.toList());
        List<ReservationRoom> allRooms = rrRepo.findByReservationIdIn(resIds);
        Map<String, List<ReservationRoom>> roomsByResIdMap = allRooms.stream()
                .collect(Collectors.groupingBy(rr -> rr.getReservation().getId()));
        
        Map<String, ReservationStatus> roomStatusMap = getLatestRoomStatusMap(allRooms);

        for (Reservation r : reservations) {
            List<ReservationRoom> rooms = roomsByResIdMap.getOrDefault(r.getId(), Collections.emptyList());
            lst.add(toReservationResponse(r, rooms, roomStatusMap));
        }
        return lst;
    }

    @Override
    public ReservationResponse getLastResByGuestId(Integer guestId) {
        Reservation r = resRepo.getLastResByGuestId(guestId)
            .orElseThrow(() -> new IllegalArgumentException("Guest has no reservation yet"));
        List<ReservationRoom> rooms = rrRepo.findByReservationId(r.getId());
        Map<String, ReservationStatus> roomStatusMap = getLatestRoomStatusMap(rooms);
        return toReservationResponse(r, rooms, roomStatusMap);
    }
    
    @Override
    public List<ReservationRoomResponse> getResRoomByResId(String resId) {
        List<ReservationRoom> lst = rrRepo.findByReservationId(resId);
        return lst.stream().map(ReservationMapper::toRoomResponse).collect(Collectors.toList());
    }

    @Override
    public ReservationRoomResponse getResRoomById(String resRoomId) {
        ReservationRoom rr = rrRepo.getByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found"));
        return ReservationMapper.toRoomResponse(rr);
    }

    @Override
    public List<ReservationGuestResponse> getResGuestByResRoom(String resRoomId) {
        List<ReservationGuest> lst = resGuestRepo.findByIdReservationRoomId(resRoomId);
        return lst.stream().map(ReservationMapper::toGuestResponse).collect(Collectors.toList());
    }

    @Override
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
    public List<ReservationGuestResponse> getGuestsByResRoomId(String resRoomId) {
        List<ReservationGuest> guests = resGuestRepo.findByIdReservationRoomId(resRoomId);
        List<ReservationGuestResponse> dtos = new ArrayList<>();
        for(ReservationGuest rg : guests){
            dtos.add(ReservationMapper.toGuestResponse(rg));
        }
        return dtos;
    }

    @Override
    public List<StatusHistoryResponse> getHistoryByReservation(String resId) {
        List<ReservationStatusHistory> lst = statusHistoryRepo.findByResId(resId);
        return lst.stream().map(ReservationMapper::toStatusHistoryResponse).collect(Collectors.toList());
    }

    @Override
    public List<StatusHistoryResponse> getHistoryByReservationRoom(String resRoomId) {
        ReservationRoom rr = rrRepo.findById(resRoomId)
                .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));

        List<ReservationStatusHistory> list = statusHistoryRepo.findByResRoomId(rr.getId());
        return list.stream().map(ReservationMapper::toStatusHistoryResponse).collect(Collectors.toList());
    }
  
    @Override
    public List<ReservationServiceResponse> getAllServicesOfResRoom(String resRoomId) {
        return rSRepo.getByResRoomId(resRoomId).stream()
            .map(HotelserviceMapper::toResponse).collect(Collectors.toList());
    }

    @Override
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
        
        // Eager load status history mapping to prevent N+1 queries
        Map<String, ReservationStatus> roomStatusMap = getLatestRoomStatusMap(rooms);
        resp.setOverallRoomStatus(computeOverallRoomStatus(rooms, r, roomStatusMap));
        
        LocalDate earliestCheckIn = null;
        LocalDate latestCheckOut = null;

        // Batch load all guests and services of these rooms to avoid N+1 queries in loop
        List<String> roomIds = rooms.stream().map(ReservationRoom::getId).collect(Collectors.toList());
        List<ReservationGuest> allGuests = resGuestRepo.findByReservationRoomIdIn(roomIds);
        Map<String, List<ReservationGuest>> guestsByRoomMap = allGuests.stream()
                .collect(Collectors.groupingBy(rg -> rg.getReservationRoom().getId()));

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

            // Load pre-fetched guests
            List<ReservationGuestResponse> guests = guestsByRoomMap.getOrDefault(rr.getId(), Collections.emptyList())
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
    public List<ReservationResponse> getMyBookings() {
        String account = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByAccount(account)
            .orElseThrow(() -> new IllegalStateException("User not found: " + account));

        Guest guest = user.getGuest();
        if (guest != null) {
            List<Reservation> reservations = resRepo.getAllResByGuestId(guest.getId());
            if (reservations.isEmpty()) {
                return Collections.emptyList();
            }

            List<String> resIds = reservations.stream().map(Reservation::getId).collect(Collectors.toList());
            List<ReservationRoom> allRooms = rrRepo.findByReservationIdIn(resIds);
            Map<String, List<ReservationRoom>> roomsByResIdMap = allRooms.stream()
                    .collect(Collectors.groupingBy(rr -> rr.getReservation().getId()));
            
            Map<String, ReservationStatus> roomStatusMap = getLatestRoomStatusMap(allRooms);

            List<ReservationResponse> responseList = new ArrayList<>();
            for (Reservation r : reservations) {
                List<ReservationRoom> rooms = roomsByResIdMap.getOrDefault(r.getId(), Collections.emptyList());
                responseList.add(toReservationResponse(r, rooms, roomStatusMap));
            }
            return responseList;
        }
        return Collections.emptyList();
    }

    private Map<String, ReservationStatus> getLatestRoomStatusMap(List<ReservationRoom> rooms) {
        if (rooms.isEmpty()) {
            return Collections.emptyMap();
        }
        List<String> roomIds = rooms.stream().map(ReservationRoom::getId).collect(Collectors.toList());
        List<ReservationStatusHistory> latestHistories = statusHistoryRepo.findLatestByResRoomIds(roomIds);
        
        Map<String, ReservationStatus> map = new HashMap<>();
        for (ReservationStatusHistory hist : latestHistories) {
            map.put(hist.getReservationRoom().getId(), hist.getNewStatus());
        }
        return map;
    }

    private String computeOverallRoomStatus(List<ReservationRoom> rooms, Reservation r, Map<String, ReservationStatus> roomStatusMap) {
        if (r.getStatus() == ReservationStatus.CANCELLED) {
            return "CANCELLED";
        }
        if (r.getStatus() == ReservationStatus.PENDING_EXPIRED) {
            return "PENDING_EXPIRED";
        }
        if (r.getStatus() == ReservationStatus.PENDING_PAYMENT) {
            return "PENDING_PAYMENT";
        }
        if (rooms == null || rooms.isEmpty()) {
            return r.getStatus().name();
        }

        boolean anyCheckIn = false;
        boolean allCheckOutOrCancelled = true;

        for (ReservationRoom rr : rooms) {
            ReservationStatus roomSt = roomStatusMap.getOrDefault(rr.getId(), ReservationStatus.PENDING_PAYMENT);
            if (roomSt == ReservationStatus.CHECK_IN) {
                anyCheckIn = true;
            }
            if (roomSt != ReservationStatus.CHECK_OUT && roomSt != ReservationStatus.CANCELLED) {
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

    private ReservationResponse toReservationResponse(Reservation r, List<ReservationRoom> rooms, Map<String, ReservationStatus> roomStatusMap) {
        ReservationResponse dto = ReservationMapper.toResponse(r, rooms);
        if (dto != null) {
            dto.setOverallRoomStatus(computeOverallRoomStatus(rooms, r, roomStatusMap));
        }
        return dto;
    }
}

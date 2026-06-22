package com.hotelreservation.modules.reservation.service.impl;

import com.hotelreservation.common.enums.ReservationStatus;
import com.hotelreservation.modules.account.entity.Guest;
import com.hotelreservation.modules.account.entity.User;
import com.hotelreservation.modules.account.repository.GuestRepository;
import com.hotelreservation.modules.account.repository.UserRepository;
import com.hotelreservation.modules.hotelservice.dto.HotelserviceRequests.AddReservationServiceRequest;
import com.hotelreservation.modules.hotelservice.entity.HotelService;
import com.hotelreservation.modules.hotelservice.entity.UsedService;
import com.hotelreservation.modules.hotelservice.repository.HotelServiceRepository;
import com.hotelreservation.modules.hotelservice.repository.UsedServiceRepository;
import com.hotelreservation.modules.reservation.dto.ReservationRequests.CreateReservationRequest;
import com.hotelreservation.modules.reservation.dto.ReservationResponses.InitialReservationResponse;
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
import com.hotelreservation.modules.reservation.service.ReservationCommandService;
import com.hotelreservation.modules.room.dto.RoomResponses.AvailableRoomResponse;
import com.hotelreservation.modules.room.entity.Room;
import com.hotelreservation.modules.room.repository.RoomRepository;
import com.hotelreservation.modules.billing.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@SuppressWarnings("null")
public class ReservationCommandServiceImpl implements ReservationCommandService {

    @Autowired private RoomRepository roomRepo;
    @Autowired private ReservationRepository resRepo;
    @Autowired private ReservationRoomRepository rrRepo;
    @Autowired private GuestRepository guestRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ReservationStatusHistoryRepository statusHistoryRepo;
    @Autowired private ReservationGuestRepository resGuestRepo;
    @Autowired private UsedServiceRepository rSRepo;
    @Autowired private HotelServiceRepository serRepo;
    @Autowired private BillRepository billRepo;

    @PersistenceContext
    private EntityManager em;

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
    public void deleteResRoom(String resRoomId) {
        if(!rrRepo.existsById(resRoomId))
            throw new IllegalArgumentException("ReservationRoom not found: " + resRoomId);
        rrRepo.deleteById(resRoomId);
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
    public void deleteReservationService(String id) {
        if(!rSRepo.existsById(id))
            throw new IllegalArgumentException("Theres no reservationService to delete");
        rSRepo.delete(id);
    }
}

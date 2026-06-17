package modules.reservation.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import modules.reservation.dto.ReservationRoomDto;
import modules.reservation.dto.AvailableRoom;
import modules.reservation.dto.CreateHoldRequest;
import modules.reservation.dto.HoldResponse;
import modules.reservation.dto.InitialReservationResponse;
import modules.reservation.dto.ReservationDto;
import common.enums.ReservationStatus;
import modules.account.entity.Guest;
import modules.reservation.entity.Reservation;
import modules.reservation.entity.ReservationRoom;
import modules.room.entity.Room;
import modules.account.entity.User;
import modules.account.repository.GuestRepository;
import modules.account.repository.UserRepository;
import modules.reservation.repository.ReservationRepository;
import modules.reservation.repository.ReservationRoomRepository;
import modules.reservation.repository.ReservationStatusHistoryRepository;
import modules.room.repository.RoomRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class ReservationDomain {
    @Autowired private RoomRepository roomRepo;
    @Autowired private ReservationRepository resRepo;
    @Autowired private ReservationRoomRepository rrRepo;
    @Autowired private GuestRepository guestRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ReservationStatusHistoryRepository statusHistoryRepo;
    @PersistenceContext
    private EntityManager em;


    public ReservationDto getByResId(String resId){
        Reservation r = resRepo.getResById(resId);
        List<ReservationRoom> lstRr = rrRepo.findByReservationId(resId);
        return ReservationDto.fromEntity(r, lstRr);
    }

    // lấy ra tất cả các reservation
    public List<ReservationDto> getAllReservations(){
        List<ReservationDto> lst = new ArrayList<>();
        
        // Sử dụng EntityManager với JPQL để eager load relationships
        jakarta.persistence.Query query = em.createQuery(
            "SELECT DISTINCT r FROM Reservation r " +
            "LEFT JOIN FETCH r.guest " +
            "LEFT JOIN FETCH r.createdBy " +
            "ORDER BY r.bookingDate DESC",
            Reservation.class
        );
        
        @SuppressWarnings("unchecked")
        List<Reservation> reservations = query.getResultList();
        
        // Log để debug
        System.out.println("Total reservations found: " + reservations.size());
        
        for(Reservation r : reservations){
            try {
                // Đảm bảo load Guest relationship
                Guest guest = r.getGuest();
                if (guest == null) {
                    System.err.println("Warning: Reservation " + r.getId() + " has null guest");
                    continue; // Skip reservations without guest
                }
                
                // Load ReservationRooms
                List<ReservationRoom> rooms = rrRepo.findByReservationId(r.getId());
                
                // Tạo DTO
                ReservationDto dto = ReservationDto.fromEntity(r, rooms);
                lst.add(dto);
            } catch (Exception e) {
                System.err.println("Error processing reservation " + r.getId() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        System.out.println("Total DTOs created: " + lst.size());
        return lst;
    }

    // xác nhận bản nháp
    @Transactional
    public InitialReservationResponse createReservationFromRequest(CreateHoldRequest req, Integer emp) {
        LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());

        // 1. Lấy thông tin khách và nhân viên
        Guest guest = guestRepo.findById(req.getGuestId())
            .orElseThrow(() -> new IllegalStateException("Guest not found: " + req.getGuestId()));

        User createdBy = userRepo.findById(emp)
            .orElseThrow(() -> new IllegalStateException("User not found: " + emp));

        // 2. Tạo reservation ở trạng thái PENDING_PAYMENT (hoặc CONFIRMED nếu bạn muốn)
        String resId = UUID.randomUUID().toString();

        resRepo.insertReservation(
            resId,
            guest.getId(),
            BigDecimal.ZERO, // sẽ tính lại sau
            createdBy.getId(),
            ReservationStatus.PENDING_PAYMENT.name(), // hoặc CONFIRMED
            now
        );

        // load lại reservation (nếu cần đối tượng đầy đủ)
        Reservation res = resRepo.getLastResByGuestId(guest.getId())
            .orElseThrow(() -> new IllegalArgumentException("Reservation has not been created yet"));

        // 3. Duyệt các item khách gửi lên, giữ nguyên logic check phòng trống + tính giá
        List<Integer> roomIds = new ArrayList<>();
        List<BigDecimal> totalPrices = new ArrayList<>(); // tổng tiền 1 phòng (finalPrice * nights)
        List<Long> nightStays = new ArrayList<>();

        for (CreateHoldRequest.Item it : req.getItems()) {
            // tìm phòng khả dụng
            List<AvailableRoom> available = roomRepo.findAvailableRooms(
                it.getCheckIn(), it.getCheckOut(), it.getRoomName(), null);

            // lấy đúng số phòng yêu cầu
            List<Integer> candidate = available.stream()
                .filter(a -> a.getName().equals(it.getRoomName()))
                .map(AvailableRoom::getRoomId)
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

                // giá 1 đêm sau giảm
                BigDecimal basePrice = r.getRoomType().getBasePrice();
                BigDecimal discount = (nights >= 7) ? new BigDecimal("0.10") : BigDecimal.ZERO;
                BigDecimal finalPricePerNight = basePrice.multiply(BigDecimal.ONE.subtract(discount));

                // tổng tiền cho phòng này
                BigDecimal totalOfRoom = finalPricePerNight.multiply(BigDecimal.valueOf(nights));

                String resRoomId = UUID.randomUUID().toString();

                // insert vào reservationRoom (giữ nguyên cấu trúc như confirmFromHold)
                rrRepo.insertResRoom(
                    resRoomId,
                    res.getId(),
                    roomId,
                    it.getCheckIn(),
                    it.getCheckOut(),
                    finalPricePerNight, // đơn giá 1 đêm
                    totalOfRoom          // tổng tiền phòng này
                );

                // insert lịch sử trạng thái phòng
                statusHistoryRepo.insertResStatusHistory(
                    resRoomId,
                    ReservationStatus.PENDING_PAYMENT.name(),
                    ReservationStatus.PENDING_PAYMENT.name(),
                    now,
                    createdBy.getId(),
                    "initial create from request"
                );

                // hoàn thiện danh sách trả về
                roomIds.add(roomId);
                nightStays.add(nights);
                totalPrices.add(totalOfRoom);
            }
        }

        // 4. Tính lại tổng tiền của reservation
        em.flush();
        resRepo.recalculateTotal(res.getId());
        em.refresh(res);

        // 5. Chuẩn bị DTO trả về
        // Nếu muốn bỏ hẳn khái niệm "Hold" thì có thể tạo DTO khác thay cho HoldResponse
        HoldResponse holdEcho = new HoldResponse(
            roomIds,
            totalPrices,   // ở đây mình trả tổng tiền từng phòng
            nightStays,
            now            // không còn expiresAt, dùng now như thời điểm tạo
        );

        String guestName = guest.getFirstName() + " " + guest.getLastName();

        return new InitialReservationResponse(
            guestName,
            holdEcho,
            resId,
            res.getTotalAmount()
        );
    }

    public List<ReservationDto> getAllResByGuestId(Integer guestId){
        List<ReservationDto> lst = new ArrayList<>();

        List<Reservation> reservations = resRepo.getAllResByGuestId(guestId);
        for(Reservation r : reservations){
            lst.add(ReservationDto.fromEntity(r, rrRepo.findByReservationId(r.getId())));
        }

        return lst;
    }

    // lấy đơn reservation mới nhất của một khách hàng
    public ReservationDto getLastResByGuestId(Integer guestId){
        Reservation r = resRepo.getLastResByGuestId(guestId)
            .orElseThrow(() -> new IllegalArgumentException("Guest has no reservation yet"));
        return ReservationDto.fromEntity(r, rrRepo.findByReservationId(r.getId()));
    }
    
    // lấy ra các resRoom của reservation
    public List<ReservationRoomDto> getResRoomByResId(String resId){
        List<ReservationRoom> lst = rrRepo.findByReservationId(resId);
        return lst.stream().map(ReservationRoomDto::fromEntity).collect(Collectors.toList());
    }
    

    // public void delete(Integer resId){
    //     if(!resRepo.existsById(resId))
    //         throw new IllegalArgumentException("Reservation not found: " + resId);
    //     resRepo.deleteById(resId);
    // }
}
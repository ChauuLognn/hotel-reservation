package com.BADBOY.hotel_reservation.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.BADBOY.hotel_reservation.dto.ReservationRoom.ChangeStatusRequest;
import com.BADBOY.hotel_reservation.dto.ReservationRoom.StatusHistoryDTO;
import com.BADBOY.hotel_reservation.entity.Enum.ReservationStatus;
import com.BADBOY.hotel_reservation.entity.Reservation;
import com.BADBOY.hotel_reservation.entity.ReservationRoom;
import com.BADBOY.hotel_reservation.entity.User;
import com.BADBOY.hotel_reservation.entity.reservation_status_history.ReservationStatusHistory;
import com.BADBOY.hotel_reservation.repository.BillRepository;
import com.BADBOY.hotel_reservation.repository.Reservation.ReservationRepository;
import com.BADBOY.hotel_reservation.repository.ReservationRoomRepository;
import com.BADBOY.hotel_reservation.repository.ReservationStatusHistoryRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class ReservationStatusHistoryDomain {
    @Autowired private ReservationRepository resRepo;
    @Autowired private ReservationRoomRepository resRoomRepo;
    @Autowired private ReservationStatusHistoryRepository resHistoryRepo;
    @Autowired private BillRepository billRepo;
    private Integer systemUserId;

    @PersistenceContext
    private EntityManager em;

    // tạo MAP<from, set<to>> chứa trạng thái from có thể cập nhật thành các trạng thái to
    private static final Map<ReservationStatus, Set<ReservationStatus>> Allowed;
    static {
        Map<ReservationStatus, Set<ReservationStatus>> m = new EnumMap<>(ReservationStatus.class);
        m.put(ReservationStatus.PENDING_PAYMENT, EnumSet.of(ReservationStatus.CONFIRMED, ReservationStatus.PENDING_EXPIRED));
        m.put(ReservationStatus.CONFIRMED, EnumSet.of(ReservationStatus.CHECK_IN,ReservationStatus.CANCELLED));
        m.put(ReservationStatus.CHECK_IN, EnumSet.of(ReservationStatus.CHECK_OUT));
        m.put(ReservationStatus.CHECK_OUT, EnumSet.noneOf(ReservationStatus.class));
        m.put(ReservationStatus.CANCELLED, EnumSet.noneOf(ReservationStatus.class));
        Allowed = m;
    }

    // check chuyển đổi trạng thái hợp lệ
    private void ValidTransitionStatus(ReservationStatus from, ReservationStatus to){
        // trùng trạng thái
        if(from == to)
            throw new IllegalStateException("Duplicated status");

        // trạng thái chuyển đổi không có trong allowed
        Set<ReservationStatus> allowed = Allowed.get(from);
        if(allowed == null || !allowed.contains(to))
            throw new IllegalStateException("Invalide transition from " + from + " to " + to);
    }

    // lấy các bản ghi thay đổi trạng thái của các resRoom trong reservation
    @Transactional(readOnly = true)
    public List<StatusHistoryDTO> getHistoryByReservation(String resId){
        List<ReservationStatusHistory> lst = 
                resHistoryRepo.findByResId(resId);
        List<StatusHistoryDTO> result = 
                lst.stream().map(StatusHistoryDTO::fromEntity).collect(Collectors.toList());
        return result;
    }

    // lấy các bản ghi thay đổi trạng thái của resRoom
    @Transactional(readOnly = true)
    public List<StatusHistoryDTO> getHistoryByReservationRoom(String resRoomId) {
        ReservationRoom rr = resRoomRepo.findById(resRoomId)
                .orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));

        List<ReservationStatusHistory> list =
                resHistoryRepo.findByResRoomId(rr.getId());
        List<StatusHistoryDTO> result =
                list.stream().map(StatusHistoryDTO::fromEntity).collect(Collectors.toList());
        return result;
    }
 
    // lấy trạng thái mới nhất của resRoom
    private ReservationStatus CurrentStatusOfResRoom(String resRoomId) {
        Optional<ReservationStatusHistory> opt = resHistoryRepo.findLatestByResRoomId(resRoomId);
        if (opt.isPresent()) {
            return opt.get().getNewStatus();
        }
        return ReservationStatus.PENDING_PAYMENT;
    }

    // cập nhật trạng thái cho một resRoom
    @Transactional
    public void updateResRoomStatus(String resRoomId,
                                    ChangeStatusRequest req,
                                    Integer updatedByUserId) {
        // lấy thông tin của resRoom
        ReservationRoom rr = resRoomRepo.getByResRoomId(resRoomId).
            orElseThrow(() -> new IllegalArgumentException("ReservationRoom not found: " + resRoomId));

        // lấy thông tin của reservation
        Reservation r = rr.getReservation();
        // lấy trạng thái của reservation
        ReservationStatus statusOfRes = r.getStatus();

        // chỉ có thể cập nhật trạng thái cho resRoom khi đã thanh toán cho reservation
        // vậy nên nếu trạng thái của reservation là pending thì báo lỗi
        if(statusOfRes == ReservationStatus.PENDING_PAYMENT)
            throw new IllegalStateException("reservation of this room has to be confirmed first");

        // trạng thái mới nhất của resRoom và trạng thái muốn thay đổi
        ReservationStatus oldSt = CurrentStatusOfResRoom(resRoomId);
        ReservationStatus newSt = req.getNewStatus();

        // kiểm tra tính hợp lệ
        ValidTransitionStatus(oldSt, newSt);

        LocalDateTime now = LocalDateTime.now();

        // nếu resRoom CHECKOUt thì tự động tạo bill service cho resRoom
        if(newSt == ReservationStatus.CHECK_OUT)
            billRepo.insertServiceBills(resRoomId, now);
        // nếu resRoom CANCELLED thì tự động tạo bill refund cho resRoom
        else if(newSt == ReservationStatus.CANCELLED){
            // CANCELLED hợp lệ nếu resRoom chưa đến giờ checkIn
            if(rr.getCheckInTime().isAfter(LocalDate.now()))
                throw new IllegalStateException("cant cancelled resRoom that over time of checkIn");
            billRepo.insertRefundBills(resRoomId, now);
        }

        Integer effectiveUserId = updatedByUserId != null? updatedByUserId : systemUserId;
        User by = em.getReference(User.class, effectiveUserId);

        // thêm bản ghi mới cho reservationStatusHistory
        resHistoryRepo.insertResStatusHistory(resRoomId, oldSt.name(), 
            newSt.name(), now, by.getId(), req.getReason());
    }             
    

    // cập nhật trạng thái cho reservation
    @Transactional
    public void updateReservationStatus(String resId, ChangeStatusRequest req, Integer updatedBy){
        // lấy thông tin của reservation
        Reservation r = resRepo.findById(resId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        // trạng thái mới và hiện tại của reservation
        ReservationStatus newSt = req.getNewStatus();
        ReservationStatus oldSt = r.getStatus();

        // kiểm tra tính hợp lệ
        ValidTransitionStatus(oldSt, newSt);

        // reservation chỉ có trạng thái pending, confirmed và cancelled
        if(newSt == ReservationStatus.CHECK_IN || newSt == ReservationStatus.CHECK_OUT)
            throw new IllegalStateException("invalid new status to update for a reservation");

        // nếu trạng thái mới là confirmed
        // thì tạo các bill tiền phòng cho mọi resRoom của reservation
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

        // lấy ra các resRoom của reservation
        List<ReservationRoom> rooms = resRoomRepo.findByReservationId(resId);

        // check xem có phòng nào thay đổi trạng thái không
        boolean noRoomHasChangeStatus = true;

        for(ReservationRoom rr : rooms){
            String resRoomId = rr.getId();

            try{
                updateResRoomStatus(resRoomId, req, by.getId());
                // nếu có phòng thay đổi trạng thái thì cập nhật false
                noRoomHasChangeStatus = false;
            } catch(IllegalStateException e){
                // nếu gặp lỗi trong khi chạy method updateResRoomStatus thì bỏ qua
            }
        }
        // nếu trạng thái muốn cập nhật cho reservation là cancelled
        if(newSt == ReservationStatus.CANCELLED){
            // nếu có resRoom được cập nhật thì cập nhật cho reservation
            if(!noRoomHasChangeStatus){
                r.setStatus(newSt);
                resRepo.save(r);
            }
            // nếu không báo lỗi
            else throw new IllegalStateException("cant change status for this reservation");
        }
    }
}

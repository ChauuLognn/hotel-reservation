package com.BADBOY.hotel_reservation.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.BADBOY.hotel_reservation.dto.ReservationGuest.GuestStayDto;
import com.BADBOY.hotel_reservation.dto.ReservationGuest.ReservationGuestDto;
import com.BADBOY.hotel_reservation.dto.ReservationRoom.ChangeStatusRequest;
import com.BADBOY.hotel_reservation.entity.Enum.ReservationStatus;
import com.BADBOY.hotel_reservation.entity.Guest;
import com.BADBOY.hotel_reservation.entity.ReservationRoom;
import com.BADBOY.hotel_reservation.entity.reservation_guest.ReservationGuest;
import com.BADBOY.hotel_reservation.entity.reservation_status_history.ReservationStatusHistory;
import com.BADBOY.hotel_reservation.repository.Person.GuestRepository;
import com.BADBOY.hotel_reservation.repository.ReservationGuestRepository;
import com.BADBOY.hotel_reservation.repository.ReservationStatusHistoryRepository;

@Service
public class ReservationGuestDomain {
    @Autowired private ReservationGuestRepository resGuestRepo;
    @Autowired private GuestRepository guestRepo;
    @Autowired private ReservationStatusHistoryRepository rshRepo;
    @Autowired private ReservationStatusHistoryDomain rshDomain;
    
    // lấy thông tin mọi lần lưu trú của một khách hàng
    @Transactional(readOnly=true)
    public GuestStayDto getStaysOfGuest(Integer guestId){
        // lấy ra các bản ghi reservationGuest của khách hàng
        List<ReservationGuest> lst = resGuestRepo.findByIdGuestId(guestId);

        // lấy thông tin của khách
        Guest guest = guestRepo.findById(guestId)
            .orElseThrow(()-> new IllegalArgumentException("Guest not found: " + guestId));

        // hoàn thiện dto trả về cho người dùng xem
        GuestStayDto dto = new GuestStayDto();
        dto.setGuestName(guest.getFirstName() + guest.getLastName());
        dto.setIdentityNum(guest.getIdentityNum());
        List<GuestStayDto.Item> items = new ArrayList<>();
        for(ReservationGuest rg : lst){
            GuestStayDto.Item tmp = new GuestStayDto.Item();
            tmp.setRoomId(rg.getReservationRoom().getRoom().getId());
            tmp.setCheckInAt(rg.getCheckInAt());
            tmp.setCheckOutAt(rg.getCheckOutAt());
            items.add(tmp);
        }
        dto.setItems(items);
        return dto;
    }

    // lấy danh sách khách đã đăng ký cho một ReservationRoom
    @Transactional(readOnly=true)
    public List<ReservationGuestDto> getGuestsByResRoomId(String resRoomId){
        List<ReservationGuest> guests = resGuestRepo.findByIdReservationRoomId(resRoomId);
        List<ReservationGuestDto> dtos = new ArrayList<>();
        for(ReservationGuest rg : guests){
            dtos.add(ReservationGuestDto.fromEntity(rg));
        }
        return dtos;
    }


    // tạo bản ghi mới cho reservationGuest
    @Transactional
    public ReservationGuestDto createReservationGuest(String resRoomId, Integer guestId){     
        // lấy ra lần thay đổi trạng thái mới nhất của resRoom   
        ReservationStatusHistory rsh = rshRepo.findLatestByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("this resRoom has no status record"));
        
        // nếu lần thay đổi trạng thái mới nhất của resRoom là PENDING_PAYMENT
        // hoặc CHECK_OUT(trạng thái này tồn tại nếu các khách hàng ở trong resRoom đã check_out hết)
        // hoặc CANCELLED thì không thể thêm khách hàng nào vào resRoom này nữa
        if(rsh.getNewStatus() != ReservationStatus.CONFIRMED 
            && rsh.getNewStatus() != ReservationStatus.CHECK_IN)
            throw new IllegalStateException("Cant add guest to this room");

        // thêm bản ghi mới cho reservationGuest
        resGuestRepo.insertResGuest(resRoomId, guestId);

        // lấy ra bản ghi vừa thêm
        ReservationGuest rg = resGuestRepo.findByResRoomIdAndGuestId(resRoomId, guestId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationGuest has not been created"));
        
        // trả về dto cho người dùng xem
        return ReservationGuestDto.fromEntity(rg);
    }

    // cập nhật thời gian checkIn cho khách
    @Transactional
    public ReservationGuestDto setCheckIn(String resRoomId, Integer guestId, LocalDateTime checkInAt){
        // lấy ra lần thay đổi trạng thái mới nhất của resRoom
        ReservationStatusHistory rsh = rshRepo.findLatestByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("this resRoom has no status record"));

        // nếu trạng thái mới nhất là PENDING_PAYMENT thì ko thể checkIn
        // tất nhiên khách còn không được đăng ký ở resRoom
        if(rsh.getNewStatus() == ReservationStatus.PENDING_PAYMENT)
            throw new IllegalStateException("ResRoom has to be paid first");

        // lấy ra bản ghi lưu trú của khách trong resRoom
        ReservationGuest rg = resGuestRepo.findByResRoomIdAndGuestId(resRoomId, guestId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationGuest not found"));
        
        // nếu khách đã checkIn rồi thì báo lỗi
        if(rg.getCheckInAt() != null)
            throw new IllegalStateException("Guest đã checkIn");

        // lấy thông tin resRoom
        ReservationRoom rr = rg.getReservationRoom();

        // lấy các mốc thời gian: hiện tại, checkIn, checkOut đã đăng ký cho resRoom
        LocalDateTime now = LocalDateTime.now();
        if(checkInAt == null) checkInAt = now;
        LocalDate roomCheckIn = rr.getCheckInTime();
        LocalDate roomCheckOut = rr.getCheckOutTime();

        // TODO: Bỏ qua validation thời gian để test - NÊN BẬT LẠI TRONG PRODUCTION
        // nếu chưa đến giờ checkIn thì báo lỗi
        // if(checkInAt.isBefore(LocalDateTime.of(roomCheckIn, LocalTime.of(12, 0))))
        //     throw new IllegalStateException("Chưa đến giờ Check_In");

        // đã qua thời gian checkOut thì báo lỗi
        // if(!checkInAt.isBefore(LocalDateTime.of(roomCheckOut, LocalTime.of(14, 0))))
        //     throw new IllegalStateException("Phòng đã hết thời gian ở");
        
        // CheckIn cho khách: cập nhật thời gian checkInAt trong bản ghi rg
        rg.setCheckInAt(checkInAt);

        // nếu trạng thái mới nhất của resRoom đang là CONFIRMED thì cập nhật là CHECK_IN
        if(rsh.getNewStatus() == ReservationStatus.CONFIRMED)
            rshRepo.insertResStatusHistory(resRoomId, rsh.getNewStatus().name(), 
                "CHECK_IN", now, 9, "automatically");

        // trả về dto cho người dùng xem
        return ReservationGuestDto.fromEntity(rg);
    }

    // cập nhật thời gian checkOut cho khách
    @Transactional
    public ReservationGuestDto setCheckOut(String resRoomId, Integer guestId, LocalDateTime checkOutAt){
        // lấy ra lần thay đổi trạng thái mới nhất của resRoom
        ReservationStatusHistory rsh = rshRepo.findLatestByResRoomId(resRoomId)
            .orElseThrow(() -> new IllegalArgumentException("this resRoom has no status record"));

        // lấy ra bản ghi lưu trú của khách trong resRoom
        ReservationGuest rg = resGuestRepo.findByResRoomIdAndGuestId(resRoomId, guestId)
            .orElseThrow(() -> new IllegalArgumentException("ReservationGuest not found"));

        // lỗi nếu khách chưa checkIn
        if(rg.getCheckInAt() == null)
            throw new IllegalStateException("Khách chưa Check_In");
        
        // lỗi nếu khách đã checkOut
        if(rg.getCheckOutAt() != null)
            throw new IllegalStateException("Khách đã Check_Out");

        // thiết lập thời gian checkOut là bây giờ
        if(checkOutAt == null)
            checkOutAt = LocalDateTime.now();

        // check cái này cho cẩn thận
        if(checkOutAt.isBefore(rg.getCheckInAt()))
            throw new IllegalArgumentException("thời điểm Check_Out phải sau khi Check_In");

        // checkOut cho khách: cập nhật giá trị cho checkOutAt trong bản ghi rg
        rg.setCheckOutAt(checkOutAt);

        // nếu tất cả khách đã đăng ký trong resRoom
        // và trạng thái mới nhất là CHECK_IN thì cập nhật thành CHECK_OUT
        if(resGuestRepo.cntGuestHasNotCheckOutInResRoom(resRoomId) == 0 &&
            rsh.getNewStatus() == ReservationStatus.CHECK_IN)
            rshDomain.updateResRoomStatus(resRoomId, 
                new ChangeStatusRequest(ReservationStatus.CHECK_OUT, "automatically"), 9);
            
        // trả về dto cho người dùng xem
        return ReservationGuestDto.fromEntity(rg);
    }
}

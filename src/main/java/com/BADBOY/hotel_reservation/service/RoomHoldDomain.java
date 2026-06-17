// package com.BADBOY.hotel_reservation.service;

// import java.math.BigDecimal;
// import java.time.LocalDateTime;
// import java.time.ZoneId;
// import java.time.temporal.ChronoUnit;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.UUID;
// import java.util.stream.Collectors;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.BADBOY.hotel_reservation.dto.reservation.AvailableRoom;
// import com.BADBOY.hotel_reservation.dto.reservation.CreateHoldRequest;
// import com.BADBOY.hotel_reservation.dto.reservation.HoldResponse;
// import com.BADBOY.hotel_reservation.entity.Room;
// import com.BADBOY.hotel_reservation.repository.Reservation.RoomHoldRepository;
// import com.BADBOY.hotel_reservation.repository.RoomRepository;

// @Service
// public class RoomHoldDomain {
//     @Autowired
//     private RoomRepository roomRepo;
//     @Autowired
//     private RoomHoldRepository holdRepo;

//     // tạo bản nháp
//     @Transactional
//     public HoldResponse createHold(CreateHoldRequest req){
//         LocalDateTime now = LocalDateTime.now(ZoneId.systemDefault());
        
//         // thiết lập thời gian hết hạn giữ chỗ là 10 phút kể từ lúc tạo bản nháp
//         int deadTime = 600;
//         LocalDateTime expiresAt = now.plusSeconds(deadTime);

//         // tạo token
//         String token = UUID.randomUUID().toString();

//         // danh sách các phòng được chọn cùng giá phòng và số đêm ở
//         List<Integer> RoomIds = new ArrayList<>();
//         List<BigDecimal> FinalPrices = new ArrayList<>();
//         List<Long> Nights = new ArrayList<>();

//         for(CreateHoldRequest.Item it : req.getItems()){ 
//             // tìm các phòng khả dụng theo yêu cầu của khách
//             // chi tiết truy vấn xem trong RoomRepository
//             List<AvailableRoom> available = roomRepo.findAvailableRooms(
//                 it.getCheckIn(), it.getCheckOut(), it.getRoomName(), null);
            
//             // lấy ra đúng số phòng yêu cầu
//             List<Integer> candidate = available.stream()
//                     .filter(a -> a.getName().equals(it.getRoomName()))
//                     .map(AvailableRoom::getRoomId)
//                     .limit(it.getRooms())
//                     .collect(Collectors.toList());
            
//             // nếu không đủ thì báo lỗi
//             if(candidate.size() < it.getRooms()){
//                 throw new IllegalStateException("Not enough rooms available for this request");
//             }

//             // tính số đêm ở của mỗi cặp (checkIn, checkOut)
//             long nights = ChronoUnit.DAYS.between(it.getCheckIn(), it.getCheckOut());
//             if(nights <= 0) throw new IllegalArgumentException("checkOut must be after checkIn");

//             for(Integer roomId : candidate){ // xét các phòng khả dụng
//                 // lấy thông tin của phòng
//                 Room r = roomRepo.findRoom(roomId).
//                     orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));

//                 // tính giá cho mỗi phòng: giá sau giảm * số đêm
//                 // hiện tại discount = 0
//                 BigDecimal basePrice = r.getRoomType().getBasePrice();
//                 BigDecimal discount = (nights >= 7) ? new BigDecimal("0.10"): BigDecimal.ZERO;
//                 BigDecimal finalPrice = basePrice.multiply(BigDecimal.ONE.subtract(discount));

//                 String roomHoldId = UUID.randomUUID().toString();

//                 // tạo bản ghi mới cho bảng roomHold chờ khách confirmed
//                 holdRepo.insertRoomHold(roomHoldId, req.getGuestId(), roomId, it.getCheckIn(), 
//                         it.getCheckOut(), expiresAt, token, now, finalPrice);

//                 // hoàn thiện danh sách
//                 RoomIds.add(roomId);
//                 FinalPrices.add(finalPrice);
//                 Nights.add(nights);
//             }
//         }

//         // trả về dto cho người dùng xem
//         HoldResponse res = new HoldResponse(token, RoomIds, FinalPrices, Nights, expiresAt);
//         return res;
//     }
// }

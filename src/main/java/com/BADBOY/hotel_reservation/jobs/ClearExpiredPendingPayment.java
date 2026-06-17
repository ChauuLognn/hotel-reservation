// package com.BADBOY.hotel_reservation.jobs;

// import java.time.LocalDateTime;
// import java.util.List;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Component;
// import org.springframework.transaction.annotation.Transactional;

// import com.BADBOY.hotel_reservation.dto.ReservationRoom.ChangeStatusRequest;
// import com.BADBOY.hotel_reservation.entity.Enum.ReservationStatus;
// import com.BADBOY.hotel_reservation.repository.Reservation.ReservationRepository;
// import com.BADBOY.hotel_reservation.service.ReservationStatusHistoryDomain;

// // task tự động hủy các reservation PENDING_PAID quá 10 phút kể từ khi được tạo
// // task bắt đầu chạy sau chương trình 1 phút và lặp lại mỗi 10 phút
// @Component
// public class ClearExpiredPendingPayment {
//     @Autowired private ReservationRepository resRepo;
//     @Autowired private ReservationStatusHistoryDomain statusHistoryDomain;

//     @Transactional
//     @Scheduled(
//         fixedDelayString = "${app.hold.cleanup.fixed-delay-ms:600000}",
//         initialDelayString = "${app.hold.cleanup.initial-delay-ms:60000}"
//     ) //10 phut
//     public void cancelExpiredPendings(){
//         LocalDateTime deadLine = LocalDateTime.now();

//         // lấy danh sách các resId hết hạn giữ chỗ
//         List<String> expiredIds = resRepo.findPendingReservationExpired(deadLine);

//         // nếu không có thì nghỉ
//         if(expiredIds.isEmpty()) return;

//         for (String resId : expiredIds){
//             // đổi trạng thái của reservation thành PENDING_EXPIRED
//             ChangeStatusRequest req = new ChangeStatusRequest(ReservationStatus.PENDING_EXPIRED,
//                 "Hết thời gian pending");
//             statusHistoryDomain.updateReservationStatus(resId, req, null);
//         }
        
//     }
// }

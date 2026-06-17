// package com.BADBOY.hotel_reservation.jobs;

// import java.time.LocalDateTime;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Component;
// import org.springframework.transaction.annotation.Transactional;

// import com.BADBOY.hotel_reservation.repository.Reservation.RoomHoldRepository;


// // task dọn các bản nháp đặt phòng khi hết thời gian giữ chỗ
// // roomHold sẽ không có bản ghi cứng vì dữ liệu luôn được xóa
// @Component
// public class RoomHoldRefresh {
//     @Autowired private static final Logger log = LoggerFactory.getLogger(RoomHoldRefresh.class);
//     @Autowired private RoomHoldRepository roomHoldRepo;

//     @Scheduled(
//         fixedDelayString = "${app.hold.cleanup.fixed-delay-ms:600000}",
//         initialDelayString = "${app.hold.cleanup.initial-delay-ms:60000}"
//     ) //10 phut
//     @Transactional
//     public void removeExpireHolds(){
//         LocalDateTime now = LocalDateTime.now();
//         int deleted = roomHoldRepo.deleteExpired(now);
//         if(deleted > 0)
//             log.info("RoomHold cleanup: deleted {} expired holds (<= {}).", deleted, now);
//     }
// }

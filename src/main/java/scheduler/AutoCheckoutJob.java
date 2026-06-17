package scheduler;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import modules.reservation.entity.ReservationRoom;
import modules.reservation.entity.ReservationGuest;
import modules.reservation.repository.ReservationGuestRepository;
import modules.reservation.repository.ReservationRoomRepository;
import modules.reservation.repository.ReservationStatusHistoryRepository;
import modules.reservation.service.ReservationGuestService;


// task tự động checkOut cho khách khi đến giờ resId.checkOutTime 
@Component
public class AutoCheckoutJob {
    @Autowired private ReservationGuestRepository rgRepo;
    @Autowired private ReservationStatusHistoryRepository rshRepo;
    @Autowired private ReservationRoomRepository rrRepo;
    @Autowired private ReservationGuestService rgDomain;

    @Scheduled(
        fixedDelayString = "${app.hold.cleanup.fixed-delay-ms:600000}",
        initialDelayString = "${app.hold.cleanup.initial-delay-ms:60000}"
    ) //10 phut
    public void autoCheckOutForResRoom(){
        LocalDateTime now = LocalDateTime.now();

        // lấy danh sách các id của resRoom đến giờ checkOut
        List<String> resRoomIds = rshRepo.findResRoomThatOverCheckOutTime(now);
        for(String resRoomId : resRoomIds){

            ReservationRoom rr = rrRepo.getByResRoomId(resRoomId)
                .orElseThrow(() -> new IllegalStateException("resRoom not found"));

            // lấy thông tin lưu trú của các khách ở trong resRoomUd
            List<ReservationGuest> lst = rgRepo.findByIdReservationRoomId(resRoomId);

            for (ReservationGuest x : lst) {
                try {
                    // checkOut cho khách nếu hợp lệ
                    rgDomain.setCheckOut(resRoomId,x.getGuest().getId(),
                        LocalDateTime.of(rr.getCheckOutTime(), LocalTime.of(14, 0))
                    );
                } catch (Exception e) {
                    // đối với khách đã checkOut từ trước thì sẽ in ra lời nhắn
                    System.err.println(e.getMessage());
                }
            }   
        }
    }
}
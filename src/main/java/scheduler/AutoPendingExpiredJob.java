package scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import modules.reservation.repository.ReservationRepository;
import modules.reservation.service.ReservationService;
import modules.reservation.dto.ReservationPayload.ChangeStatusRequest;
import common.enums.ReservationStatus;

/**
 * Scheduled job: tự động chuyển reservation PENDING_PAYMENT quá hạn sang PENDING_EXPIRED.
 * Sử dụng query findPendingReservationExpired đã có sẵn trong ReservationRepository.
 */
@Component
public class AutoPendingExpiredJob {

    @Autowired
    private ReservationRepository resRepo;

    @Autowired
    private ReservationService resDomain;

    /**
     * Chạy mỗi 5 phút (300000ms), delay khởi động 30s.
     * Tìm các reservation PENDING_PAYMENT đã quá 10 phút kể từ bookingDate
     * và chuyển sang PENDING_EXPIRED.
     */
    @Scheduled(
        fixedDelayString = "${app.pending-expired.fixed-delay-ms:300000}",
        initialDelayString = "${app.pending-expired.initial-delay-ms:30000}"
    )
    @Transactional
    public void expirePendingReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<String> expiredResIds = resRepo.findPendingReservationExpired(now);

        for (String resId : expiredResIds) {
            try {
                ChangeStatusRequest req = new ChangeStatusRequest(
                    ReservationStatus.PENDING_EXPIRED,
                    "Tự động hết hạn do không thanh toán trong thời gian quy định"
                );
                resDomain.updateReservationStatus(resId, req, null);
                System.out.println("[AutoPendingExpiredJob] Expired reservation: " + resId);
            } catch (Exception e) {
                System.err.println("[AutoPendingExpiredJob] Error expiring " + resId + ": " + e.getMessage());
            }
        }
    }
}

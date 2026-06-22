package com.hotelreservation.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hotelreservation.modules.reservation.repository.ReservationRepository;
import com.hotelreservation.modules.reservation.service.ReservationService;
import com.hotelreservation.modules.reservation.dto.ReservationRequests.ChangeStatusRequest;
import com.hotelreservation.common.enums.ReservationStatus;

/**
 * Scheduled job: tự động chuyển reservation PENDING_PAYMENT quá hạn sang PENDING_EXPIRED.
 * Sử dụng query findPendingReservationExpired đã có sẵn trong ReservationRepository.
 */
@Component
public class AutoPendingExpiredJob {

    private static final Logger log = LoggerFactory.getLogger(AutoPendingExpiredJob.class);

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
                log.info("[AutoPendingExpiredJob] Expired reservation: {}", resId);
            } catch (Exception e) {
                log.error("[AutoPendingExpiredJob] Error expiring reservation {}: {}", resId, e.getMessage(), e);
            }
        }
    }
}

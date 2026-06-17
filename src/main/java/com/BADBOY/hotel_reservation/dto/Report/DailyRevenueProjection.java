package com.BADBOY.hotel_reservation.dto.Report;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DailyRevenueProjection {
    LocalDate getDate();
    BigDecimal getRoomCharge();
    BigDecimal getServiceCharge();
    BigDecimal getRefundAmount();
    BigDecimal getNetRevenue();
}

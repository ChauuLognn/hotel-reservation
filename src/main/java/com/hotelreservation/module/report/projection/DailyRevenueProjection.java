package com.hotelreservation.module.report.projection;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DailyRevenueProjection {
    LocalDate getDate();
    BigDecimal getRoomCharge();
    BigDecimal getServiceCharge();
    BigDecimal getRefundAmount();
    BigDecimal getNetRevenue();
}

package com.hotelreservation.module.billing.dto.response;

import java.math.BigDecimal;

public interface ReservationBillSummaryProjection {
    String getReservationId();
    BigDecimal getTotalPaid();
    BigDecimal getTotalDue();
    BigDecimal getTotal();
}

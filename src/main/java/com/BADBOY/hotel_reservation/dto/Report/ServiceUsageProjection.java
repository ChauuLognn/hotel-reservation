package com.BADBOY.hotel_reservation.dto.Report;

import java.math.BigDecimal;

public interface ServiceUsageProjection {
    Integer getServiceId();
    String getServiceName();
    Long getTimesUsed();
    Long getTotalQuantity();
    BigDecimal getTotalRevenue();
}
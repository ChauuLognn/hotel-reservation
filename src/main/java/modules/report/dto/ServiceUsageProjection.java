package modules.report.dto;

import java.math.BigDecimal;

public interface ServiceUsageProjection {
    Integer getServiceId();
    String getServiceName();
    Long getTimesUsed();
    Long getTotalQuantity();
    BigDecimal getTotalRevenue();
}
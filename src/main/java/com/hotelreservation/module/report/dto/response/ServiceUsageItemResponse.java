package com.hotelreservation.module.report.dto.response;

import java.math.BigDecimal;
import com.hotelreservation.module.report.projection.ServiceUsageProjection;

public class ServiceUsageItemResponse {
    private String serviceName;
    private Long timesUsed;
    private Long totalQuantity;
    private BigDecimal totalRevenue;

    public static ServiceUsageItemResponse fromProjection(ServiceUsageProjection p) {
        ServiceUsageItemResponse dto = new ServiceUsageItemResponse();
        dto.serviceName = p.getServiceName();
        dto.timesUsed = p.getTimesUsed();
        dto.totalQuantity = p.getTotalQuantity();
        dto.totalRevenue = p.getTotalRevenue();
        return dto;
    }

    public String getServiceName(){ return serviceName; }
    public void setServiceName(String serviceName){ this.serviceName = serviceName; }
    public Long getTimesUsed(){ return timesUsed; }
    public void setTimesUsed(Long timesUsed){ this.timesUsed = timesUsed; }
    public Long getTotalQuantity(){ return totalQuantity; }
    public void setTotalQuantity(Long totalQuantity){ this.totalQuantity = totalQuantity; }
    public BigDecimal getTotalRevenue(){ return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue){ this.totalRevenue = totalRevenue; }
}

package modules.report.dto;

import java.math.BigDecimal;

// không cần để ý

// 1 dịch vụ + số lần dùng + tổng quantity + tổng tiền
public class ServiceUsageItemDto {
    private String serviceName;
    private Long timesUsed;
    private Long totalQuantity;
    private BigDecimal totalRevenue;

    public static ServiceUsageItemDto fromProjection(ServiceUsageProjection p){
        ServiceUsageItemDto dto = new ServiceUsageItemDto();
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
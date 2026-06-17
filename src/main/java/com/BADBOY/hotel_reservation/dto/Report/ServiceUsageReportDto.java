package com.BADBOY.hotel_reservation.dto.Report;

import java.time.LocalDate;
import java.util.List;

// không cần để ý

// báo cáo dịch vụ trong khoảng from–to
public class ServiceUsageReportDto {
    private LocalDate fromDate;
    private LocalDate toDate;
    private List<ServiceUsageItemDto> services;
    private ServiceUsageItemDto topService;

    public LocalDate getFromDate(){ return fromDate; }
    public void setFromDate(LocalDate fromDate){ this.fromDate = fromDate; }
    public LocalDate getToDate(){ return toDate; }
    public void setToDate(LocalDate toDate){ this.toDate = toDate; }
    public List<ServiceUsageItemDto> getServices(){ return services; }
    public void setServices(List<ServiceUsageItemDto> services){ this.services = services; }
    public ServiceUsageItemDto getTopService(){ return topService; }
    public void setTopService(ServiceUsageItemDto topService){ this.topService = topService; }
}
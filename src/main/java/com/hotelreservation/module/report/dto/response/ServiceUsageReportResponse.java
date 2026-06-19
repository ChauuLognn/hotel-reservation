package com.hotelreservation.module.report.dto.response;

import java.time.LocalDate;
import java.util.List;

public class ServiceUsageReportResponse {
    private LocalDate fromDate;
    private LocalDate toDate;
    private List<ServiceUsageItemResponse> services;
    private ServiceUsageItemResponse topService;

    public LocalDate getFromDate(){ return fromDate; }
    public void setFromDate(LocalDate fromDate){ this.fromDate = fromDate; }
    public LocalDate getToDate(){ return toDate; }
    public void setToDate(LocalDate toDate){ this.toDate = toDate; }
    public List<ServiceUsageItemResponse> getServices(){ return services; }
    public void setServices(List<ServiceUsageItemResponse> services){ this.services = services; }
    public ServiceUsageItemResponse getTopService(){ return topService; }
    public void setTopService(ServiceUsageItemResponse topService){ this.topService = topService; }
}

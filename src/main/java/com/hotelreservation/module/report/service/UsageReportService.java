package com.hotelreservation.module.report.service;

import com.hotelreservation.module.report.dto.response.RoomUsageReportResponse;
import com.hotelreservation.module.report.dto.response.ServiceUsageReportResponse;
import java.time.LocalDate;

public interface UsageReportService {
    RoomUsageReportResponse getRoomUsage(LocalDate fromDate, LocalDate toDate);
    ServiceUsageReportResponse getServiceUsage(LocalDate fromDate, LocalDate toDate);
}
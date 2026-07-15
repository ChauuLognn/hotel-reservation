package com.hotelreservation.report.service;

import com.hotelreservation.report.dto.ReportResponses.*;
import java.time.LocalDate;

public interface UsageReportService {
    RoomUsageReportResponse getRoomUsage(LocalDate fromDate, LocalDate toDate);
    ServiceUsageReportResponse getServiceUsage(LocalDate fromDate, LocalDate toDate);
}
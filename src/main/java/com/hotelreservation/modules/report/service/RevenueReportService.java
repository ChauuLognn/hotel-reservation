package com.hotelreservation.modules.report.service;

import com.hotelreservation.modules.report.dto.ReportResponses.RevenueReportResponse;
import java.time.LocalDate;

public interface RevenueReportService {
    RevenueReportResponse getRevenue(LocalDate fromDate, LocalDate toDate);
}
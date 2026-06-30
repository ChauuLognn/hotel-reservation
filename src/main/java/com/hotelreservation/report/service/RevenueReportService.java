package com.hotelreservation.report.service;

import com.hotelreservation.report.dto.ReportResponses.RevenueReportResponse;
import java.time.LocalDate;

public interface RevenueReportService {
    RevenueReportResponse getRevenue(LocalDate fromDate, LocalDate toDate);
}
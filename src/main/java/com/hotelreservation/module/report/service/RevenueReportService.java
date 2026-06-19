package com.hotelreservation.module.report.service;

import com.hotelreservation.module.report.dto.response.RevenueReportResponse;
import java.time.LocalDate;

public interface RevenueReportService {
    RevenueReportResponse getRevenue(LocalDate fromDate, LocalDate toDate);
}
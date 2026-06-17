package com.BADBOY.hotel_reservation.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.BADBOY.hotel_reservation.dto.Report.RevenueReportDto;
import com.BADBOY.hotel_reservation.dto.Report.RoomUsageReportDto;
import com.BADBOY.hotel_reservation.dto.Report.ServiceUsageReportDto;
import com.BADBOY.hotel_reservation.service.Report.RevenueReportDomain;
import com.BADBOY.hotel_reservation.service.Report.UsageReportDomain;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired private RevenueReportDomain revenueDomain;
    @Autowired private UsageReportDomain usageDomain;

    @GetMapping("/revenue")
    public RevenueReportDto getRevenue(
        @RequestParam("from")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate from,

        @RequestParam("to")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate to
    ){
        return revenueDomain.getRevenue(from, to);
    }

    @GetMapping("/rooms")
    public RoomUsageReportDto getRoomUsage(
        @RequestParam("from")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate from,
        @RequestParam("to")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate to
    ){
        return usageDomain.getRoomUsage(from, to);
    }

    // dịch vụ: từ ngày from đến to, tất cả dịch vụ + dịch vụ dùng nhiều nhất
    // GET /api/reports/usage/services?from=2025-11-01&to=2025-11-30
    @GetMapping("/services")
    public ServiceUsageReportDto getServiceUsage(
        @RequestParam("from")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate from,
        @RequestParam("to")
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate to
    ){
        return usageDomain.getServiceUsage(from, to);
    }
}

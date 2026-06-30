package com.hotelreservation.report.controller;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.access.prepost.PreAuthorize;

import com.hotelreservation.report.dto.ReportResponses.*;
import com.hotelreservation.report.service.RevenueReportService;
import com.hotelreservation.report.service.UsageReportService;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasAnyRole('MANAGER', 'EMPLOYEE')")
public class ReportController {

    @Autowired private RevenueReportService revenueDomain;
    @Autowired private UsageReportService usageDomain;

    @GetMapping("/revenue")
    public RevenueReportResponse getRevenue(
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
    public RoomUsageReportResponse getRoomUsage(
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
    public ServiceUsageReportResponse getServiceUsage(
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
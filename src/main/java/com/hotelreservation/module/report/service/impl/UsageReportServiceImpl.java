package com.hotelreservation.module.report.service.impl;

import com.hotelreservation.module.report.dto.response.RoomUsageItemResponse;
import com.hotelreservation.module.report.dto.response.RoomUsageReportResponse;
import com.hotelreservation.module.report.dto.response.ServiceUsageItemResponse;
import com.hotelreservation.module.report.dto.response.ServiceUsageReportResponse;
import com.hotelreservation.module.report.projection.RoomUsageProjection;
import com.hotelreservation.module.report.projection.ServiceUsageProjection;
import com.hotelreservation.module.report.service.UsageReportService;
import com.hotelreservation.module.reservation.repository.ReservationRoomRepository;
import com.hotelreservation.module.hotelservice.repository.ReservationServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class UsageReportServiceImpl implements UsageReportService {

    @Autowired private ReservationRoomRepository rrRepo;
    @Autowired private ReservationServiceRepository rsRepo;

    @Override
    public RoomUsageReportResponse getRoomUsage(LocalDate fromDate, LocalDate toDate) {
        if(fromDate == null || toDate == null)
            throw new IllegalArgumentException("fromDate and toDate must not be null");
        if(toDate.isBefore(fromDate))
            throw new IllegalArgumentException("toDate must be after or equal fromDate");

        List<RoomUsageProjection> rows = rrRepo.getRoomUsage(fromDate, toDate);

        List<RoomUsageItemResponse> items = rows.stream()
            .map(RoomUsageItemResponse::fromProjection)
            .collect(Collectors.toList());

        RoomUsageItemResponse top = items.isEmpty() ? null : items.get(0);

        RoomUsageReportResponse dto = new RoomUsageReportResponse();
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setRooms(items);
        dto.setTopRoom(top);
        return dto;
    }

    @Override
    public ServiceUsageReportResponse getServiceUsage(LocalDate fromDate, LocalDate toDate) {
        if(fromDate == null || toDate == null)
            throw new IllegalArgumentException("fromDate and toDate must not be null");
        if(toDate.isBefore(fromDate))
            throw new IllegalArgumentException("toDate must be after or equal fromDate");

        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to   = toDate.plusDays(1).atStartOfDay();

        List<ServiceUsageProjection> rows = rsRepo.getServiceUsage(from, to);

        List<ServiceUsageItemResponse> items = rows.stream()
            .map(ServiceUsageItemResponse::fromProjection)
            .collect(Collectors.toList());

        ServiceUsageItemResponse top = items.isEmpty() ? null : items.get(0);

        ServiceUsageReportResponse dto = new ServiceUsageReportResponse();
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setServices(items);
        dto.setTopService(top);
        return dto;
    }
}

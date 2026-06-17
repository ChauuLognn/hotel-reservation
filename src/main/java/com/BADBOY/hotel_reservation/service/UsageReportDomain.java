package com.BADBOY.hotel_reservation.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.BADBOY.hotel_reservation.dto.Report.RoomUsageItemDto;
import com.BADBOY.hotel_reservation.dto.Report.RoomUsageProjection;
import com.BADBOY.hotel_reservation.dto.Report.RoomUsageReportDto;
import com.BADBOY.hotel_reservation.dto.Report.ServiceUsageItemDto;
import com.BADBOY.hotel_reservation.dto.Report.ServiceUsageProjection;
import com.BADBOY.hotel_reservation.dto.Report.ServiceUsageReportDto;
import com.BADBOY.hotel_reservation.repository.ReservationRoomRepository;
import com.BADBOY.hotel_reservation.repository.ReservationServiceRepository;

@Service
@Transactional(readOnly = true)
public class UsageReportDomain {

    @Autowired private ReservationRoomRepository rrRepo;
    @Autowired private ReservationServiceRepository rsRepo;

    public RoomUsageReportDto getRoomUsage(LocalDate fromDate, LocalDate toDate){
        if(fromDate == null || toDate == null)
            throw new IllegalArgumentException("fromDate and toDate must not be null");
        if(toDate.isBefore(fromDate))
            throw new IllegalArgumentException("toDate must be after or equal fromDate");

        List<RoomUsageProjection> rows =
                rrRepo.getRoomUsage(fromDate, toDate);

        List<RoomUsageItemDto> items = rows.stream()
            .map(RoomUsageItemDto::fromProjection)
            .collect(Collectors.toList());

        RoomUsageItemDto top = items.isEmpty() ? null : items.get(0);

        RoomUsageReportDto dto = new RoomUsageReportDto();
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setRooms(items);
        dto.setTopRoom(top);
        return dto;
    }

    public ServiceUsageReportDto getServiceUsage(LocalDate fromDate, LocalDate toDate){
        if(fromDate == null || toDate == null)
            throw new IllegalArgumentException("fromDate and toDate must not be null");
        if(toDate.isBefore(fromDate))
            throw new IllegalArgumentException("toDate must be after or equal fromDate");

        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to   = toDate.plusDays(1).atStartOfDay();

        List<ServiceUsageProjection> rows =
                rsRepo.getServiceUsage(from, to);

        List<ServiceUsageItemDto> items = rows.stream()
            .map(ServiceUsageItemDto::fromProjection)
            .collect(Collectors.toList());

        ServiceUsageItemDto top = items.isEmpty() ? null : items.get(0);

        ServiceUsageReportDto dto = new ServiceUsageReportDto();
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setServices(items);
        dto.setTopService(top);
        return dto;
    }
}
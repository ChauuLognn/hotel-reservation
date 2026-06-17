package modules.report.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import modules.report.dto.RoomUsageItemDto;
import modules.report.dto.RoomUsageProjection;
import modules.report.dto.RoomUsageReportDto;
import modules.report.dto.ServiceUsageItemDto;
import modules.report.dto.ServiceUsageProjection;
import modules.report.dto.ServiceUsageReportDto;
import modules.reservation.repository.ReservationRoomRepository;
import modules.hotel_service.repository.ReservationServiceRepository;

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
package modules.report.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import modules.report.dto.DailyRevenueDto;
import modules.report.dto.DailyRevenueProjection;
import modules.report.dto.RevenueReportDto;
import modules.billing.repository.BillRepository;
import modules.reservation.repository.ReservationGuestRepository;

@Service
@Transactional(readOnly = true)
public class RevenueReportService {

    @Autowired private BillRepository billRepo;
    @Autowired private ReservationGuestRepository rgRepo;

    public RevenueReportDto getRevenue(LocalDate fromDate, LocalDate toDate){
        if(fromDate == null || toDate == null)
            throw new IllegalArgumentException("fromDate and toDate must not be null");
        if(toDate.isBefore(fromDate))
            throw new IllegalArgumentException("toDate must be after or equal fromDate");

        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to = toDate.plusDays(1).atStartOfDay(); 

        List<DailyRevenueProjection> lst = billRepo.getDailyRevenue(from, to);

        List<DailyRevenueDto> days = lst.stream()
            .map(DailyRevenueDto::fromProjection)
            .collect(Collectors.toList());

        BigDecimal totalRoom = BigDecimal.ZERO;
        BigDecimal totalService = BigDecimal.ZERO;
        BigDecimal totalRefund = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;

        for(DailyRevenueDto d : days){
            if(d.getRoomCharge() != null) totalRoom = totalRoom.add(d.getRoomCharge());
            if(d.getServiceCharge() != null) totalService = totalService.add(d.getServiceCharge());
            if(d.getRefundAmount() != null) totalRefund = totalRefund.add(d.getRefundAmount());
            if(d.getNetRevenue() != null) totalNet = totalNet.add(d.getNetRevenue());
        }

        Integer totalGuests = rgRepo.countGuestsStayed(from, to);

        RevenueReportDto dto = new RevenueReportDto();
        dto.setFromDate(fromDate);
        dto.setToDate(toDate);
        dto.setTotalGuestsStayed(totalGuests);
        dto.setTotalRoomCharge(totalRoom);
        dto.setTotalServiceCharge(totalService);
        dto.setTotalRefund(totalRefund);
        dto.setTotalNetRevenue(totalNet);
        dto.setDays(days);

        return dto;
    }
}
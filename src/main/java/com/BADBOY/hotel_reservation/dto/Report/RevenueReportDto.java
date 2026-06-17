package com.BADBOY.hotel_reservation.dto.Report;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class RevenueReportDto {
    private LocalDate fromDate;
    private LocalDate toDate;
    private Integer totalGuestsStayed;
    private BigDecimal totalRoomCharge;
    private BigDecimal totalServiceCharge;
    private BigDecimal totalRefund;
    private BigDecimal totalNetRevenue;
    private List<DailyRevenueDto> days;

    public LocalDate getFromDate(){ return fromDate; }
    public void setFromDate(LocalDate fromDate){ this.fromDate = fromDate; }
    public LocalDate getToDate(){ return toDate; }
    public void setToDate(LocalDate toDate){ this.toDate = toDate; }

    public Integer getTotalGuestsStayed(){ return totalGuestsStayed; }
    public void setTotalGuestsStayed(Integer totalGuestsStayed){ this.totalGuestsStayed = totalGuestsStayed; }
    public BigDecimal getTotalRoomCharge(){ return totalRoomCharge; }
    public void setTotalRoomCharge(BigDecimal totalRoomCharge){ this.totalRoomCharge = totalRoomCharge; }
    public BigDecimal getTotalServiceCharge(){ return totalServiceCharge; }
    public void setTotalServiceCharge(BigDecimal totalServiceCharge){ this.totalServiceCharge = totalServiceCharge; }
    public BigDecimal getTotalRefund(){ return totalRefund; }
    public void setTotalRefund(BigDecimal totalRefund){ this.totalRefund = totalRefund; }
    public BigDecimal getTotalNetRevenue(){ return totalNetRevenue; }
    public void setTotalNetRevenue(BigDecimal totalNetRevenue){ this.totalNetRevenue = totalNetRevenue; }

    public List<DailyRevenueDto> getDays(){ return days; }
    public void setDays(List<DailyRevenueDto> days){ this.days = days; }
}

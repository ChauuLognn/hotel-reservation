package modules.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailyRevenueDto {
    private LocalDate date;
    private BigDecimal roomCharge;
    private BigDecimal serviceCharge;
    private BigDecimal refundAmount;
    private BigDecimal netRevenue;

    public static DailyRevenueDto fromProjection(DailyRevenueProjection p){
        DailyRevenueDto dto = new DailyRevenueDto();
        dto.date = p.getDate();
        dto.roomCharge = p.getRoomCharge();
        dto.serviceCharge = p.getServiceCharge();
        dto.refundAmount = p.getRefundAmount();
        dto.netRevenue = p.getNetRevenue();
        return dto;
    }

    public LocalDate getDate(){ return date; }
    public void setDate(LocalDate date){ this.date = date; }
    public BigDecimal getRoomCharge(){ return roomCharge; }
    public void setRoomCharge(BigDecimal roomCharge){ this.roomCharge = roomCharge; }
    public BigDecimal getServiceCharge(){ return serviceCharge; }
    public void setServiceCharge(BigDecimal serviceCharge){ this.serviceCharge = serviceCharge; }
    public BigDecimal getRefundAmount(){ return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount){ this.refundAmount = refundAmount; }
    public BigDecimal getNetRevenue(){ return netRevenue; }
    public void setNetRevenue(BigDecimal netRevenue){ this.netRevenue = netRevenue; }
}
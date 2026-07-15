package com.hotelreservation.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import com.hotelreservation.report.projection.DailyRevenueProjection;
import com.hotelreservation.report.projection.RoomUsageProjection;
import com.hotelreservation.report.projection.ServiceUsageProjection;

public class ReportResponses {

    public static class DailyRevenueResponse {
        private LocalDate date;
        private BigDecimal roomCharge;
        private BigDecimal serviceCharge;
        private BigDecimal refundAmount;
        private BigDecimal netRevenue;

        public static DailyRevenueResponse fromProjection(DailyRevenueProjection p) {
            DailyRevenueResponse dto = new DailyRevenueResponse();
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

    public static class RevenueReportResponse {
        private LocalDate fromDate;
        private LocalDate toDate;
        private Integer totalGuestsStayed;
        private BigDecimal totalRoomCharge;
        private BigDecimal totalServiceCharge;
        private BigDecimal totalRefund;
        private BigDecimal totalNetRevenue;
        private List<DailyRevenueResponse> days;

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

        public List<DailyRevenueResponse> getDays(){ return days; }
        public void setDays(List<DailyRevenueResponse> days){ this.days = days; }
    }

    public static class RoomUsageItemResponse {
        private Integer roomId;
        private String roomTypeName;
        private Long timesBooked;
        private Long totalNights;

        public static RoomUsageItemResponse fromProjection(RoomUsageProjection p) {
            RoomUsageItemResponse dto = new RoomUsageItemResponse();
            dto.roomId = p.getRoomId();
            dto.roomTypeName = p.getRoomTypeName();
            dto.timesBooked = p.getTimesBooked();
            dto.totalNights = p.getTotalNights();
            return dto;
        }

        public Integer getRoomId(){ return roomId; }
        public void setRoomId(Integer roomId){ this.roomId = roomId; }
        public String getRoomTypeName(){ return roomTypeName; }
        public void setRoomTypeName(String roomTypeName){ this.roomTypeName = roomTypeName; }
        public Long getTimesBooked(){ return timesBooked; }
        public void setTimesBooked(Long timesBooked){ this.timesBooked = timesBooked; }
        public Long getTotalNights(){ return totalNights; }
        public void setTotalNights(Long totalNights){ this.totalNights = totalNights; }
    }

    public static class RoomUsageReportResponse {
        private LocalDate fromDate;
        private LocalDate toDate;
        private List<RoomUsageItemResponse> rooms;
        private RoomUsageItemResponse topRoom;

        public LocalDate getFromDate(){ return fromDate; }
        public void setFromDate(LocalDate fromDate){ this.fromDate = fromDate; }
        public LocalDate getToDate(){ return toDate; }
        public void setToDate(LocalDate toDate){ this.toDate = toDate; }
        public List<RoomUsageItemResponse> getRooms(){ return rooms; }
        public void setRooms(List<RoomUsageItemResponse> rooms){ this.rooms = rooms; }
        public RoomUsageItemResponse getTopRoom(){ return topRoom; }
        public void setTopRoom(RoomUsageItemResponse topRoom){ this.topRoom = topRoom; }
    }

    public static class ServiceUsageItemResponse {
        private String serviceName;
        private Long timesUsed;
        private Long totalQuantity;
        private BigDecimal totalRevenue;

        public static ServiceUsageItemResponse fromProjection(ServiceUsageProjection p) {
            ServiceUsageItemResponse dto = new ServiceUsageItemResponse();
            dto.serviceName = p.getServiceName();
            dto.timesUsed = p.getTimesUsed();
            dto.totalQuantity = p.getTotalQuantity();
            dto.totalRevenue = p.getTotalRevenue();
            return dto;
        }

        public String getServiceName(){ return serviceName; }
        public void setServiceName(String serviceName){ this.serviceName = serviceName; }
        public Long getTimesUsed(){ return timesUsed; }
        public void setTimesUsed(Long timesUsed){ this.timesUsed = timesUsed; }
        public Long getTotalQuantity(){ return totalQuantity; }
        public void setTotalQuantity(Long totalQuantity){ this.totalQuantity = totalQuantity; }
        public BigDecimal getTotalRevenue(){ return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue){ this.totalRevenue = totalRevenue; }
    }

    public static class ServiceUsageReportResponse {
        private LocalDate fromDate;
        private LocalDate toDate;
        private List<ServiceUsageItemResponse> services;
        private ServiceUsageItemResponse topService;

        public LocalDate getFromDate(){ return fromDate; }
        public void setFromDate(LocalDate fromDate){ this.fromDate = fromDate; }
        public LocalDate getToDate(){ return toDate; }
        public void setToDate(LocalDate toDate){ this.toDate = toDate; }
        public List<ServiceUsageItemResponse> getServices(){ return services; }
        public void setServices(List<ServiceUsageItemResponse> services){ this.services = services; }
        public ServiceUsageItemResponse getTopService(){ return topService; }
        public void setTopService(ServiceUsageItemResponse topService){ this.topService = topService; }
    }
}

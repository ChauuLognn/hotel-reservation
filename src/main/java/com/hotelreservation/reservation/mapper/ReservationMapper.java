package com.hotelreservation.reservation.mapper;

import com.hotelreservation.reservation.dto.ReservationResponses.*;
import com.hotelreservation.reservation.entity.Reservation;
import com.hotelreservation.reservation.entity.ReservationRoom;
import com.hotelreservation.reservation.entity.ReservationGuest;
import com.hotelreservation.reservation.entity.ReservationStatusHistory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public class ReservationMapper {

    public static ReservationResponse toResponse(Reservation r, List<ReservationRoom> rooms) {
        if (r == null) return null;
        List<Integer> roomIds = new ArrayList<>();
        List<String> roomNames = new ArrayList<>();
        List<BigDecimal> prices = new ArrayList<>();
        List<Long> nights = new ArrayList<>();

        LocalDate earliestCheckIn = null;
        LocalDate latestCheckOut = null;

        if (rooms != null) {
            for (ReservationRoom rr : rooms) {
                roomIds.add(rr.getRoom().getId());
                if (rr.getRoom().getRoomType() != null) {
                    roomNames.add(rr.getRoom().getRoomType().getName());
                }
                prices.add(rr.getTotalPrice());
                long d = ChronoUnit.DAYS.between(rr.getCheckInTime(), rr.getCheckOutTime());
                nights.add(d);

                if (earliestCheckIn == null || rr.getCheckInTime().isBefore(earliestCheckIn)) {
                    earliestCheckIn = rr.getCheckInTime();
                }
                if (latestCheckOut == null || rr.getCheckOutTime().isAfter(latestCheckOut)) {
                    latestCheckOut = rr.getCheckOutTime();
                }
            }
        }

        String guestName = "";
        String guestPhone = "";
        if (r.getGuest() != null) {
            guestName = r.getGuest().getFirstName() + " " + r.getGuest().getLastName();
            guestPhone = r.getGuest().getPhone();
        }

        ReservationResponse dto = new ReservationResponse();
        dto.setId(r.getId());
        dto.setGuestName(guestName);
        dto.setGuestPhone(guestPhone);
        dto.setTotal(r.getTotalAmount());
        if (r.getStatus() != null) {
            dto.setStatus(r.getStatus().name());
        }
        dto.setBookingDate(r.getBookingDate());
        dto.setRoomIds(roomIds);
        dto.setRoomNames(roomNames);
        dto.setPrices(prices);
        dto.setNights(nights);
        dto.setCheckIn(earliestCheckIn);
        dto.setCheckOut(latestCheckOut);
        return dto;
    }

    public static ReservationRoomResponse toRoomResponse(ReservationRoom rr) {
        if (rr == null) return null;
        ReservationRoomResponse dto = new ReservationRoomResponse();
        dto.setId(rr.getId());
        if (rr.getRoom() != null) {
            dto.setRoomId(rr.getRoom().getId());
        }
        dto.setCheckInTime(rr.getCheckInTime());
        dto.setCheckOutTime(rr.getCheckOutTime());
        dto.setTotalPrice(rr.getTotalPrice());
        return dto;
    }

    public static ReservationGuestResponse toGuestResponse(ReservationGuest rg) {
        if (rg == null) return null;
        ReservationGuestResponse dto = new ReservationGuestResponse();
        if (rg.getGuest() != null) {
            dto.setGuestId(rg.getGuest().getId());
            dto.setIdentityNum(rg.getGuest().getIdentityNum());
            dto.setGuestName(rg.getGuest().getFirstName() + " " + rg.getGuest().getLastName());
        }
        dto.setCheckInAt(rg.getCheckInAt());
        dto.setCheckOutAt(rg.getCheckOutAt());
        return dto;
    }

    public static StatusHistoryResponse toStatusHistoryResponse(ReservationStatusHistory e) {
        if (e == null) return null;
        StatusHistoryResponse dto = new StatusHistoryResponse();
        if (e.getReservationRoom() != null && e.getReservationRoom().getRoom() != null) {
            dto.setRoomId(e.getReservationRoom().getRoom().getId());
        }
        dto.setOldStatus(e.getOldStatus());
        dto.setNewStatus(e.getNewStatus());
        dto.setUpdatedAt(e.getUpdatedAt());
        dto.setReason(e.getReason());
        return dto;
    }

    private ReservationMapper() {}
}

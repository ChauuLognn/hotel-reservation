package com.hotelreservation;

import com.hotelreservation.common.enums.ReservationStatus;
import com.hotelreservation.module.reservation.entity.Reservation;
import com.hotelreservation.module.reservation.entity.ReservationRoom;
import com.hotelreservation.module.reservation.entity.ReservationStatusHistory;
import com.hotelreservation.module.reservation.repository.ReservationGuestRepository;
import com.hotelreservation.module.reservation.repository.ReservationRoomRepository;
import com.hotelreservation.module.reservation.repository.ReservationStatusHistoryRepository;
import com.hotelreservation.module.reservation.service.impl.ReservationServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRoomRepository rrRepo;

    @Mock
    private ReservationStatusHistoryRepository statusHistoryRepo;

    @Mock
    private ReservationGuestRepository resGuestRepo;

    @InjectMocks
    private ReservationServiceImpl reservationService;

    @Test
    void createReservationGuest_overlapStays_throwsException() {
        String resRoomId = "res-room-id";
        Integer guestId = 12;

        ReservationStatusHistory rsh = new ReservationStatusHistory();
        rsh.setNewStatus(ReservationStatus.CONFIRMED);

        ReservationRoom rr = new ReservationRoom();
        rr.setId(resRoomId);
        rr.setCheckInTime(LocalDate.now());
        rr.setCheckOutTime(LocalDate.now().plusDays(2));

        when(statusHistoryRepo.findLatestByResRoomId(resRoomId)).thenReturn(Optional.of(rsh));
        when(rrRepo.getByResRoomId(resRoomId)).thenReturn(Optional.of(rr));
        when(resGuestRepo.countOverlappingStays(guestId, resRoomId, rr.getCheckInTime(), rr.getCheckOutTime())).thenReturn(1L);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            reservationService.createReservationGuest(resRoomId, guestId);
        });

        assertEquals("Khách hàng đã có phòng khác trong thời gian này", exception.getMessage());
        verify(resGuestRepo, never()).insertResGuest(anyString(), anyInt());
    }
}

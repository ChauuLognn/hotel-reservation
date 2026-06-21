package com.hotelreservation;

import com.hotelreservation.module.billing.dto.response.ReservationBillResponse;
import com.hotelreservation.module.billing.repository.BillRepository;
import com.hotelreservation.module.billing.service.impl.BillServiceImpl;
import com.hotelreservation.module.reservation.entity.Reservation;
import com.hotelreservation.module.reservation.entity.ReservationRoom;
import com.hotelreservation.module.reservation.repository.ReservationGuestRepository;
import com.hotelreservation.module.reservation.repository.ReservationRoomRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillServiceTest {

    @Mock
    private BillRepository billRepo;

    @Mock
    private ReservationRoomRepository rrRepo;

    @Mock
    private ReservationGuestRepository resGuestRepo;

    @InjectMocks
    private BillServiceImpl billService;

    @Test
    void createReservationBillSummary_noRooms_throwsException() {
        String resId = "res-id";
        when(rrRepo.findByReservationId(resId)).thenReturn(Collections.emptyList());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            billService.createReservationBillSummary(resId);
        });

        assertEquals("Reservation not found: " + resId, exception.getMessage());
    }
}

package com.hotelreservation;

import com.hotelreservation.modules.billing.repository.BillRepository;
import com.hotelreservation.modules.billing.service.impl.BillServiceImpl;
import com.hotelreservation.modules.reservation.repository.ReservationGuestRepository;
import com.hotelreservation.modules.reservation.repository.ReservationRoomRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;

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

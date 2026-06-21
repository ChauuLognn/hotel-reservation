package com.hotelreservation;

import com.hotelreservation.common.enums.RoomStatus;
import com.hotelreservation.module.room.dto.request.CreateRoomRequest;
import com.hotelreservation.module.room.dto.response.RoomResponse;
import com.hotelreservation.module.room.entity.Room;
import com.hotelreservation.module.room.entity.RoomType;
import com.hotelreservation.module.room.repository.RoomRepository;
import com.hotelreservation.module.room.repository.RoomTypeRepository;
import com.hotelreservation.module.room.service.impl.RoomServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepo;

    @Mock
    private RoomTypeRepository rtRepo;

    @InjectMocks
    private RoomServiceImpl roomService;

    private CreateRoomRequest createRoomRequest;
    private RoomType roomType;
    private Room room;

    @BeforeEach
    void setUp() {
        createRoomRequest = new CreateRoomRequest();
        createRoomRequest.setId(101);
        createRoomRequest.setTypeName("VIP Suite");
        createRoomRequest.setStatus("READY");

        roomType = new RoomType();
        roomType.setId(1);
        roomType.setName("VIP Suite");

        room = new Room();
        room.setId(101);
        room.setRoomType(roomType);
        room.setStatus(RoomStatus.READY);
    }

    @Test
    void createRoom_success() {
        when(roomRepo.findRoom(101)).thenReturn(Optional.empty()).thenReturn(Optional.of(room));
        when(rtRepo.findByName("VIP Suite")).thenReturn(Optional.of(roomType));

        RoomResponse response = roomService.create(createRoomRequest);

        assertNotNull(response);
        assertEquals(101, response.getId());
        verify(roomRepo, times(1)).insertRoom(101, 1, "READY");
    }

    @Test
    void createRoom_duplicateId_throwsException() {
        when(roomRepo.findRoom(101)).thenReturn(Optional.of(room));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            roomService.create(createRoomRequest);
        });

        assertEquals("Số phòng này đã tồn tại.", exception.getMessage());
        verify(roomRepo, never()).insertRoom(anyInt(), anyInt(), anyString());
    }
}

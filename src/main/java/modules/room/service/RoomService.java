package modules.room.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import modules.room.dto.RoomPayload.RoomCreateRequest;
import modules.room.dto.RoomPayload.RoomDto;
import modules.reservation.dto.ReservationPayload.AvailableRoom;
import modules.room.entity.Room;
import modules.room.entity.RoomType;
import modules.room.repository.RoomRepository;
import modules.room.repository.RoomTypeRepository;

@Service
@Transactional
public class RoomService {
    @Autowired private RoomRepository roomRepo;
    @Autowired private RoomTypeRepository rtRepo;


    // tìm phòng theo yêu cầu của khách
    public List<AvailableRoom> findAvaiableRooms(
        String roomTypeName, LocalDate checkIn, LocalDate checkOut
    ){
        String effectiveRoomTypeName = null;
        Byte safeMinCapacity = null;

        if (roomTypeName != null && !roomTypeName.isBlank()) {
            RoomType rt = rtRepo.findByName(roomTypeName)
                .orElseThrow(() -> new IllegalArgumentException("no room has that name: " + roomTypeName));
            effectiveRoomTypeName = roomTypeName;
            Byte minCapacity = rt.getCapacity();
            safeMinCapacity = (minCapacity == null) ? 0 : minCapacity;
        }

        return roomRepo.findAvailableRooms(checkIn, checkOut, effectiveRoomTypeName, safeMinCapacity);
    }

    public RoomDto create(RoomCreateRequest rq){
        RoomType rt = rtRepo.findByName(rq.getTypeName())
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found: " + rq.getTypeName()));

        roomRepo.insertRoom(rq.getId(),rt.getId(),rq.getStatus());
        Room room = roomRepo.findRoom(rq.getId())
            .orElseThrow(() -> new IllegalStateException("Insert error: Cannot reload Room"));
        return RoomDto.fromEntity(room);  
    }

    @Transactional(readOnly = true)
    public List<RoomDto> getAll(){
        return roomRepo.takeAll().stream()
            .map(RoomDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomDto getById(Integer id){
        Room r = roomRepo.findRoom(id)
            .orElseThrow(() -> new IllegalArgumentException("Room not found: " + id));
        return RoomDto.fromEntity(r);
    }
    
    public RoomDto update(Integer id, RoomCreateRequest rq){
        roomRepo.findRoom(id)
            .orElseThrow(() -> new IllegalArgumentException("Room not found: " + id));

        RoomType rt = rtRepo.findByName(rq.getTypeName())
            .orElseThrow(() -> new IllegalArgumentException("RoomType not found: " + rq.getTypeName()));

        roomRepo.updateRoom(id,rt.getId(),rq.getStatus());

        Room updated = roomRepo.findRoom(id)
            .orElseThrow(() -> new IllegalStateException("Cannot reload room after update"));

        return RoomDto.fromEntity(updated);
    }

    public void delete(Integer id){
        roomRepo.findRoom(id)
            .orElseThrow(() -> new IllegalArgumentException("Room not found: " + id));
        roomRepo.deleteRoom(id);
    }
}
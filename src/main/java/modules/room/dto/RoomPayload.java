package modules.room.dto;

import java.math.BigDecimal;
import modules.room.entity.Room;
import modules.room.entity.RoomType;

public class RoomPayload {

    public static class RoomCreateRequest {
        private Integer id;
        private String typeName;
        private String status;


        public String getTypeName() {
            return typeName;
        }

        public void setTypeName(String typeName) {
            this.typeName = typeName;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }


    }

    public static class RoomDto {
        private Integer id;
        private String typeName;
        private String status;

        public static RoomDto fromEntity(Room entity) {
            RoomDto dto = new RoomDto();
            dto.setId(entity.getId());
            dto.setTypeName(entity.getRoomType().getName());
            dto.setStatus(entity.getStatus().name());
            return dto;
        }

        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public String getTypeName() {
            return typeName;
        }

        public void setTypeName(String typeName) {
            this.typeName = typeName;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }


    }

    public static class RoomTypeCreateRequest {
        private String name;
        private Byte capacity;
        private BigDecimal basePrice;
        private String description;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Byte getCapacity() {
            return capacity;
        }

        public void setCapacity(Byte capacity) {
            this.capacity = capacity;
        }

        public BigDecimal getBasePrice() {
            return basePrice;
        }

        public void setBasePrice(BigDecimal basePrice) {
            this.basePrice = basePrice;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

    }

    public static class RoomTypeDto {
        private String name;
        private Byte capacity;
        private BigDecimal basePrice;
        private String description;

        public static RoomTypeDto fromEntity(RoomType rt){
            RoomTypeDto dto = new RoomTypeDto();
            dto.setName(rt.getName());
            dto.setCapacity(rt.getCapacity());
            dto.setBasePrice(rt.getBasePrice());
            dto.setDescription(rt.getDescription());
            return dto;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Byte getCapacity() {
            return capacity;
        }

        public void setCapacity(Byte capacity) {
            this.capacity = capacity;
        }

        public BigDecimal getBasePrice() {
            return basePrice;
        }

        public void setBasePrice(BigDecimal basePrice) {
            this.basePrice = basePrice;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }


    }
}

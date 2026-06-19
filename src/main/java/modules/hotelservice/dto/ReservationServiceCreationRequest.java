package modules.hotelservice.dto;

// không cần để ý

// thông tin tạo bản ghi lưu dịch vụ được sử dụng bởi resRoom
public class ReservationServiceCreationRequest {
    private String name;
    private Byte quantity;

    public Byte getQuantity() {
        return quantity;
    }

    public String getName() {
        return name;
    }

}
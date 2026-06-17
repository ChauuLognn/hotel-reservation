package modules.reservation.dto;

import java.math.BigDecimal;

// không cần để ý

// thông tin bản nháp đã được xác nhận trả về để người dùng xem
public class InitialReservationResponse {
    private String reservationId;
    private String guestName;
    private BigDecimal total;
    private HoldResponse hold;

    public InitialReservationResponse(String guestName, HoldResponse hold, String reservationId, BigDecimal total) {
        this.guestName = guestName;
        this.hold = hold;
        this.reservationId = reservationId;
        this.total = total;
    }

    public String getReservationId() { return reservationId; }
    public void setReservationId(String reservationId) { this.reservationId = reservationId; }
    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public HoldResponse getHold() { return hold; }
    public void setHold(HoldResponse hold) { this.hold = hold; }    
}
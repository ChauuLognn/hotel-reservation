package modules.hotel_service.entity;
import modules.account.entity.User;
import modules.reservation.entity.ReservationRoom;


import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "reservationService")
public class ReservationService {

    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id; // CHAR(36) - thường là UUID

    @ManyToOne
    @JoinColumn(
        name = "reservationRoomId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_resservice_resroom")
    )
    private ReservationRoom reservationRoom;

    @ManyToOne
    @JoinColumn(
        name = "serviceId",
        nullable = false,
        foreignKey = @ForeignKey(name = "FK_resservice_service")
    )
    private Service service;

    @Column(name = "quantity", nullable = false)
    private Byte quantity = 1;

    @Column(name = "totalAmount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "usedAt", nullable = false)
    private LocalDateTime usedAt;

    @ManyToOne
    @JoinColumn(name = "createdBy",
                nullable = false,
                foreignKey = @ForeignKey(name = "FK_reservationService_user"))
    private User createdBy;

    public String getId(){return id;}
    public void setId(String id){this.id = id;}
    public ReservationRoom getReservationRoom(){return reservationRoom;}
    public void setReservationRoom(ReservationRoom reservationRoom){this.reservationRoom = reservationRoom;}
    public Service getService(){return service;}
    public void setService(Service service){this.service = service;}
    public Byte getQuantity(){return quantity;}
    public void setQuantity(Byte quantity){this.quantity = quantity;}
    public BigDecimal getTotalAmount(){return totalAmount;}
    public void setTotalAmount(BigDecimal totalAmount){this.totalAmount = totalAmount;}
    public LocalDateTime getUsedAt(){return usedAt;}
    public void setUsedAt(LocalDateTime usedAt){this.usedAt = usedAt;}
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
}